package com.hackathon.riskengine.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hackathon.riskengine.dto.AssetClassBreakdownDto;
import com.hackathon.riskengine.dto.PortfolioSummaryDto;
import com.hackathon.riskengine.dto.SectorBreakdownDto;
import com.hackathon.riskengine.model.AssetType;
import com.hackathon.riskengine.model.PortfolioAsset;
import com.hackathon.riskengine.repository.PortfolioAssetRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@Service
public class PortfolioService {

    private static final Logger logger = LoggerFactory.getLogger(PortfolioService.class);

    private final PortfolioAssetRepository portfolioAssetRepository;
    private final ObjectMapper objectMapper;

    public PortfolioService(PortfolioAssetRepository portfolioAssetRepository, ObjectMapper objectMapper) {
        this.portfolioAssetRepository = portfolioAssetRepository;
        this.objectMapper = objectMapper;
    }

    public List<PortfolioAsset> getAllAssets() {
        return portfolioAssetRepository.findAll();
    }

    public Optional<PortfolioAsset> getAssetById(Long id) {
        return portfolioAssetRepository.findById(id);
    }

    public List<PortfolioAsset> getAssetsByType(AssetType assetType) {
        return portfolioAssetRepository.findByAssetType(assetType);
    }

    public List<PortfolioAsset> getAssetsBySector(String sector) {
        return portfolioAssetRepository.findBySector(sector);
    }

    @Transactional
    public PortfolioAsset saveAsset(PortfolioAsset asset) {
        return portfolioAssetRepository.save(asset);
    }

    @Transactional
    public void deleteAsset(Long id) {
        portfolioAssetRepository.deleteById(id);
    }

    /**
     * Computes institutional-grade portfolio metrics and multi-dimensional aggregations.
     */
    public PortfolioSummaryDto getPortfolioSummary() {
        List<PortfolioAsset> assets = portfolioAssetRepository.findAll();
        PortfolioSummaryDto summary = new PortfolioSummaryDto();

        if (assets.isEmpty()) {
            return summary;
        }

        double totalNotional = 0.0;
        Map<AssetType, Double> classNotional = new EnumMap<>(AssetType.class);
        Map<AssetType, Long> classCount = new EnumMap<>(AssetType.class);

        Map<String, Double> sectorNotional = new LinkedHashMap<>();
        Map<String, Long> sectorCount = new LinkedHashMap<>();

        Map<String, Double> currencyNotional = new LinkedHashMap<>();

        double weightedDurationSum = 0.0;
        double fixedIncomeNotional = 0.0;

        double couponWeightedSum = 0.0;
        double couponEligibleNotional = 0.0;

        for (PortfolioAsset a : assets) {
            double notional = a.getNotionalValue();
            totalNotional += notional;

            // Asset class
            classNotional.put(a.getAssetType(), classNotional.getOrDefault(a.getAssetType(), 0.0) + notional);
            classCount.put(a.getAssetType(), classCount.getOrDefault(a.getAssetType(), 0L) + 1);

            // Sector
            sectorNotional.put(a.getSector(), sectorNotional.getOrDefault(a.getSector(), 0.0) + notional);
            sectorCount.put(a.getSector(), sectorCount.getOrDefault(a.getSector(), 0L) + 1);

            // Currency
            currencyNotional.put(a.getCurrency(), currencyNotional.getOrDefault(a.getCurrency(), 0.0) + notional);

            // Duration for Bonds
            if (a.getAssetType() == AssetType.BOND && a.getDuration() != null) {
                weightedDurationSum += a.getDuration() * notional;
                fixedIncomeNotional += notional;
            }

            // Coupon / Interest rate
            if (a.getInterestRate() != null) {
                couponWeightedSum += a.getInterestRate() * notional;
                couponEligibleNotional += notional;
            }
        }

        summary.setTotalNotionalValue(round(totalNotional));
        summary.setTotalAssetCount(assets.size());

        // Asset class breakdowns
        List<AssetClassBreakdownDto> classList = new ArrayList<>();
        for (AssetType type : AssetType.values()) {
            double cNotional = classNotional.getOrDefault(type, 0.0);
            long count = classCount.getOrDefault(type, 0L);
            double pct = totalNotional > 0 ? (cNotional / totalNotional) * 100.0 : 0.0;
            classList.add(new AssetClassBreakdownDto(type, count, round(cNotional), round(pct)));
        }
        summary.setAssetClassBreakdown(classList);

        // Sector breakdowns
        List<SectorBreakdownDto> sectorList = new ArrayList<>();
        for (Map.Entry<String, Double> entry : sectorNotional.entrySet()) {
            double sNotional = entry.getValue();
            long count = sectorCount.getOrDefault(entry.getKey(), 0L);
            double pct = totalNotional > 0 ? (sNotional / totalNotional) * 100.0 : 0.0;
            sectorList.add(new SectorBreakdownDto(entry.getKey(), count, round(sNotional), round(pct)));
        }
        summary.setSectorBreakdown(sectorList);

        // Currency allocation
        Map<String, Double> currencyAllocation = new LinkedHashMap<>();
        for (Map.Entry<String, Double> entry : currencyNotional.entrySet()) {
            double pct = totalNotional > 0 ? (entry.getValue() / totalNotional) * 100.0 : 0.0;
            currencyAllocation.put(entry.getKey(), round(pct));
        }
        summary.setCurrencyAllocation(currencyAllocation);

        // Weighted duration & coupon
        double avgDuration = fixedIncomeNotional > 0 ? weightedDurationSum / fixedIncomeNotional : 0.0;
        double avgCoupon = couponEligibleNotional > 0 ? couponWeightedSum / couponEligibleNotional : 0.0;
        summary.setPortfolioWeightedDuration(round(avgDuration));
        summary.setAverageCouponRate(round(avgCoupon));

        return summary;
    }

    /**
     * Resets the portfolio to the benchmark synthetic 15-asset dataset.
     */
    @Transactional
    public List<PortfolioAsset> resetToDefaultSynthetic() {
        portfolioAssetRepository.deleteAll();
        return seedSyntheticPortfolio();
    }

    @Transactional
    public List<PortfolioAsset> seedSyntheticPortfolio() {
        List<PortfolioAsset> assets = new ArrayList<>();
        try {
            Path path = resolveDataFile("synthetic_portfolio.json");
            if (Files.exists(path)) {
                List<Map<String, Object>> list = objectMapper.readValue(
                        path.toFile(),
                        new TypeReference<>() {}
                );

                for (Map<String, Object> map : list) {
                    PortfolioAsset asset = new PortfolioAsset();
                    asset.setAssetName((String) map.get("assetName"));
                    asset.setAssetType(AssetType.valueOf((String) map.get("assetType")));
                    asset.setNotionalValue(toDouble(map.get("notionalValue")));
                    asset.setInterestRate(map.get("interestRate") != null ? toDouble(map.get("interestRate")) : null);
                    asset.setDuration(map.get("duration") != null ? toDouble(map.get("duration")) : null);
                    asset.setSector((String) map.get("sector"));
                    asset.setCurrency((String) map.get("currency"));
                    assets.add(asset);
                }

                List<PortfolioAsset> saved = portfolioAssetRepository.saveAll(assets);
                logger.info("Successfully seeded {} portfolio assets from {}", saved.size(), path.toAbsolutePath());
                return saved;
            }
        } catch (Exception e) {
            logger.warn("Could not read synthetic_portfolio.json: {}. Using default memory list.", e.getMessage());
        }

        // Hardcoded Fallback Seed if file not found
        assets = createDefaultAssets();
        return portfolioAssetRepository.saveAll(assets);
    }

    private List<PortfolioAsset> createDefaultAssets() {
        List<PortfolioAsset> list = new ArrayList<>();
        list.add(new PortfolioAsset("JPMorgan Term Loan", AssetType.LOAN, 50.0, 5.2, null, "Banking", "USD"));
        list.add(new PortfolioAsset("US Treasury 10Y", AssetType.BOND, 100.0, 3.8, 8.2, "Government", "USD"));
        list.add(new PortfolioAsset("Apple Corp Bond 5Y", AssetType.BOND, 30.0, 4.1, 4.5, "Technology", "USD"));
        list.add(new PortfolioAsset("S&P 500 Futures", AssetType.DERIVATIVE, 75.0, null, null, "Index", "USD"));
        list.add(new PortfolioAsset("EUR/USD FX Forward", AssetType.DERIVATIVE, 40.0, null, null, "FX", "EUR"));
        list.add(new PortfolioAsset("Tesla Equity", AssetType.EQUITY, 20.0, null, null, "Auto", "USD"));
        list.add(new PortfolioAsset("Goldman Sachs Loan", AssetType.LOAN, 60.0, 4.9, null, "Banking", "USD"));
        list.add(new PortfolioAsset("Brazil Sovereign Bond", AssetType.BOND, 25.0, 6.5, 6.0, "EM Sovereign", "USD"));
        list.add(new PortfolioAsset("Crude Oil Swap", AssetType.DERIVATIVE, 35.0, null, null, "Commodity", "USD"));
        list.add(new PortfolioAsset("NVIDIA Equity", AssetType.EQUITY, 15.0, null, null, "Technology", "USD"));
        list.add(new PortfolioAsset("UK Gilt 5Y", AssetType.BOND, 45.0, 3.2, 4.8, "Government", "GBP"));
        list.add(new PortfolioAsset("Vanguard REIT ETF", AssetType.EQUITY, 22.0, null, null, "Real Estate", "USD"));
        list.add(new PortfolioAsset("Microsoft Equity", AssetType.EQUITY, 18.0, null, null, "Technology", "USD"));
        list.add(new PortfolioAsset("Deutsche Bank CDS", AssetType.DERIVATIVE, 30.0, null, null, "Banking", "EUR"));
        list.add(new PortfolioAsset("India Govt Bond 7Y", AssetType.BOND, 20.0, 7.1, 5.5, "EM Sovereign", "INR"));
        return list;
    }

    private double toDouble(Object obj) {
        if (obj == null) return 0.0;
        if (obj instanceof Number num) return num.doubleValue();
        try {
            return Double.parseDouble(obj.toString());
        } catch (Exception e) {
            return 0.0;
        }
    }

    private double round(double val) {
        return Math.round(val * 100.0) / 100.0;
    }

    private Path resolveDataFile(String fileName) {
        Path path = Paths.get("data", fileName);
        if (Files.exists(path)) return path;

        path = Paths.get("..", "data", fileName);
        if (Files.exists(path)) return path;

        path = Paths.get("..", "..", "data", fileName);
        if (Files.exists(path)) return path;

        return Paths.get(fileName);
    }
}
