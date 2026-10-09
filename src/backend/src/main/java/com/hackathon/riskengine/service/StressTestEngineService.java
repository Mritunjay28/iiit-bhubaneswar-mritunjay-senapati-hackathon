package com.hackathon.riskengine.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hackathon.riskengine.dto.ShockScenarioDto;
import com.hackathon.riskengine.dto.StressTestAssetDetailDto;
import com.hackathon.riskengine.dto.StressTestRequestDto;
import com.hackathon.riskengine.dto.StressTestSummaryResponseDto;
import com.hackathon.riskengine.model.*;
import com.hackathon.riskengine.repository.PortfolioAssetRepository;
import com.hackathon.riskengine.repository.StressTestResultRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class StressTestEngineService {

    private static final Logger logger = LoggerFactory.getLogger(StressTestEngineService.class);

    private final PortfolioAssetRepository portfolioAssetRepository;
    private final StressTestResultRepository stressTestResultRepository;
    private final ObjectMapper objectMapper;

    // In-memory scenario registry loaded from shock_scenarios.json
    private final Map<EventType, ShockScenarioDto> scenarioRegistry = new ConcurrentHashMap<>();

    public StressTestEngineService(
            PortfolioAssetRepository portfolioAssetRepository,
            StressTestResultRepository stressTestResultRepository,
            ObjectMapper objectMapper) {
        this.portfolioAssetRepository = portfolioAssetRepository;
        this.stressTestResultRepository = stressTestResultRepository;
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void initScenarios() {
        loadShockScenarios();
    }

    /**
     * Loads shock scenarios from JSON file or initializes defaults.
     */
    public synchronized void loadShockScenarios() {
        try {
            Path path = resolveDataFile("shock_scenarios.json");
            if (Files.exists(path)) {
                Map<String, Map<String, Object>> map = objectMapper.readValue(
                        path.toFile(),
                        new TypeReference<>() {}
                );
                for (Map.Entry<String, Map<String, Object>> entry : map.entrySet()) {
                    EventType eventType = EventType.valueOf(entry.getKey());
                    Map<String, Object> data = entry.getValue();

                    ShockScenarioDto scenario = new ShockScenarioDto(
                            (String) data.getOrDefault("scenarioName", eventType.name()),
                            eventType,
                            (String) data.getOrDefault("description", ""),
                            toDouble(data.get("equityShock")),
                            toDouble(data.get("interestRateShock")),
                            toDouble(data.get("creditSpreadShockBps")),
                            toDouble(data.get("fxShock")),
                            toDouble(data.get("commodityShock"))
                    );
                    scenarioRegistry.put(eventType, scenario);
                }
                logger.info("Successfully loaded {} shock scenarios from {}", scenarioRegistry.size(), path.toAbsolutePath());
                return;
            }
        } catch (Exception e) {
            logger.warn("Could not load shock_scenarios.json: {}. Falling back to default scenarios.", e.getMessage());
        }

        // Hardcoded Institutional Defaults
        populateDefaultScenarios();
    }

    private void populateDefaultScenarios() {
        scenarioRegistry.put(EventType.GEOPOLITICAL, new ShockScenarioDto(
                "Geopolitical Crisis", EventType.GEOPOLITICAL,
                "Cross-border conflict escalation, trade sanctions, and flight to safe-haven assets",
                -0.12, 0.0050, 150.0, -0.05, 0.15
        ));
        scenarioRegistry.put(EventType.MACROECONOMIC, new ShockScenarioDto(
                "Macro Downturn & Rate Hike", EventType.MACROECONOMIC,
                "Persistent inflation triggers central bank rate increases and contraction in industrial demand",
                -0.08, 0.0200, 100.0, -0.03, -0.05
        ));
        scenarioRegistry.put(EventType.CREDIT_EVENT, new ShockScenarioDto(
                "Credit Crunch & Default Cascade", EventType.CREDIT_EVENT,
                "Major corporate rating downgrades and debt default concerns widen systemic credit spreads",
                -0.15, 0.0100, 250.0, -0.02, -0.08
        ));
        scenarioRegistry.put(EventType.MERGER_ACQUISITION, new ShockScenarioDto(
                "M&A Market Disruption", EventType.MERGER_ACQUISITION,
                "Antitrust blocks and financing re-pricing disrupt mega-deal valuations",
                -0.03, 0.0000, 50.0, 0.0, 0.0
        ));
        scenarioRegistry.put(EventType.REGULATORY, new ShockScenarioDto(
                "Regulatory Crackdown", EventType.REGULATORY,
                "Global regulators enforce higher capital requirements and antitrust scrutiny on tech and banks",
                -0.06, 0.0000, 75.0, -0.01, 0.0
        ));
        scenarioRegistry.put(EventType.EARNINGS, new ShockScenarioDto(
                "Corporate Earnings Shock", EventType.EARNINGS,
                "Widespread corporate margin compression and downward quarterly earnings revisions",
                -0.05, 0.0000, 30.0, 0.0, 0.0
        ));
        scenarioRegistry.put(EventType.PRODUCT_LAUNCH, new ShockScenarioDto(
                "Product Disruption & Market Shift", EventType.PRODUCT_LAUNCH,
                "Next-generation AI and semiconductor releases shift competitive moats across tech hardware",
                -0.02, 0.0000, 20.0, 0.0, 0.0
        ));
        logger.info("Initialized default {} shock scenarios into registry", scenarioRegistry.size());
    }

    public List<ShockScenarioDto> getAllScenarios() {
        return new ArrayList<>(scenarioRegistry.values());
    }

    public ShockScenarioDto getScenario(EventType eventType) {
        return scenarioRegistry.getOrDefault(eventType, scenarioRegistry.get(EventType.MACROECONOMIC));
    }

    /**
     * Executes a portfolio stress test triggered by an event type or custom parameters.
     */
    @Transactional
    public StressTestSummaryResponseDto executeStressTest(StressTestRequestDto request) {
        List<PortfolioAsset> assets = portfolioAssetRepository.findAll();
        if (assets.isEmpty()) {
            throw new IllegalStateException("Cannot run stress test: Portfolio is empty. Please seed portfolio first.");
        }

        EventType eventType = request.getEventType() != null ? request.getEventType() : EventType.MACROECONOMIC;
        ShockScenarioDto baseScenario = getScenario(eventType);

        // Apply parameter overrides if present, otherwise default to baseline scenario
        if (request.getEventType() != null && !scenarioRegistry.containsKey(request.getEventType())) {
            throw new com.hackathon.riskengine.exception.InvalidScenarioException("Unknown event type: " + request.getEventType());
        }
        String scenarioName = (request.getScenarioName() != null && !request.getScenarioName().isBlank())
                ? request.getScenarioName() : baseScenario.getScenarioName();

        double equityShock = request.getEquityShock() != null ? request.getEquityShock() : baseScenario.getEquityShock();
        double interestRateShock = request.getInterestRateShock() != null ? request.getInterestRateShock() : baseScenario.getInterestRateShock();
        Double spreadOverride = request.getCreditSpreadShockBps() != null
                ? request.getCreditSpreadShockBps()
                : request.getCreditSpreadShock();
        double spreadShockBps = spreadOverride != null ? spreadOverride : baseScenario.getCreditSpreadShockBps();
        double fxShock = request.getFxShock() != null ? request.getFxShock() : baseScenario.getFxShock();
        double commodityShock = request.getCommodityShock() != null ? request.getCommodityShock() : baseScenario.getCommodityShock();

        logger.info("Running Stress Test: '{}' [EventType: {}] (Eq: {}%, IR: +{}bps, Spread: +{}bps, FX: {}%, Com: {}%)",
                scenarioName, eventType, round(equityShock * 100), round(interestRateShock * 10000),
                round(spreadShockBps), round(fxShock * 100), round(commodityShock * 100));

        double totalValBefore = 0.0;
        double totalValAfter = 0.0;
        List<StressTestAssetDetail> details = new ArrayList<>();

        Map<String, Double> assetClassPnl = new HashMap<>();
        Map<String, Double> sectorPnl = new HashMap<>();

        String worstHitAsset = null;
        double worstHitLoss = 0.0;

        for (PortfolioAsset asset : assets) {
            double notional = asset.getNotionalValue();
            totalValBefore += notional;

            double shockPercent = calculateAssetShock(asset, equityShock, interestRateShock, spreadShockBps, fxShock, commodityShock);
            double valAfter = Math.max(0.0, notional * (1.0 + shockPercent));
            double pnl = valAfter - notional;
            totalValAfter += valAfter;

            if (pnl < worstHitLoss) {
                worstHitLoss = pnl;
                worstHitAsset = asset.getAssetName();
            }

            // Aggregate by Asset Class
            String className = asset.getAssetType().name();
            assetClassPnl.put(className, assetClassPnl.getOrDefault(className, 0.0) + pnl);

            // Aggregate by Sector
            String sectorName = asset.getSector();
            sectorPnl.put(sectorName, sectorPnl.getOrDefault(sectorName, 0.0) + pnl);

            StressTestAssetDetail detail = new StressTestAssetDetail(
                    asset.getId(),
                    asset.getAssetName(),
                    asset.getAssetType().name(),
                    round(notional),
                    round(valAfter),
                    round(pnl),
                    round(shockPercent * 100.0)
            );
            details.add(detail);
        }

        double totalPnl = totalValAfter - totalValBefore;
        double pctChange = totalValBefore > 0 ? (totalPnl / totalValBefore) * 100.0 : 0.0;

        // Quantitative Value at Risk (VaR) calculations based on stressed standard deviation
        double impliedStressVolatility = Math.abs(pctChange) / 100.0 * 0.40 + 0.015;
        double var95 = round(1.645 * impliedStressVolatility * totalValBefore);
        double var99 = round(2.326 * impliedStressVolatility * totalValBefore);

        // Build JPA Entity
        StressTestResult result = new StressTestResult(
                request.getTriggerSignalId(),
                eventType,
                scenarioName,
                round(totalValBefore),
                round(totalValAfter),
                round(totalPnl),
                round(pctChange),
                LocalDateTime.now()
        );

        for (StressTestAssetDetail detail : details) {
            result.addAssetDetail(detail);
        }

        StressTestResult savedResult = stressTestResultRepository.save(result);

        // Map to Response DTO
        return mapToDto(savedResult, assetClassPnl, sectorPnl, var95, var99, worstHitAsset, worstHitLoss);
    }

    /**
     * Mathematical Multi-Asset Shock Formula Implementation
     */
    public double calculateAssetShock(
            PortfolioAsset asset,
            double equityShock,
            double interestRateShock,
            double spreadShockBps,
            double fxShock,
            double commodityShock) {

        switch (asset.getAssetType()) {
            case BOND: {
                // Fixed Income: -ModifiedDuration * DeltaRate - Duration * (DeltaSpread / 10000) + 0.5 * Convexity * (DeltaRate)^2
                double duration = asset.getDuration() != null ? asset.getDuration() : 5.0;
                double deltaRate = interestRateShock;
                double deltaSpread = spreadShockBps / 10000.0;
                double convexity = (duration * duration) / 2.0;

                double rateImpact = -duration * deltaRate;
                double spreadImpact = -duration * deltaSpread;
                double convexityImpact = 0.5 * convexity * (deltaRate * deltaRate);

                double totalBondShock = rateImpact + spreadImpact + convexityImpact;
                return Math.max(-0.95, totalBondShock);
            }

            case LOAN: {
                // Banking Loans: Floating or semi-fixed; low interest rate duration, but significant credit spread widening & ECL
                double deltaSpread = spreadShockBps / 10000.0;
                double effectiveTenor = 3.2; // Standard commercial term loan tenor
                double defaultMigrationBuffer = 0.015 * (spreadShockBps / 100.0);

                double loanShock = -(deltaSpread * effectiveTenor) - defaultMigrationBuffer;
                return Math.max(-0.95, loanShock);
            }

            case EQUITY: {
                // Equities: Base equity shock adjusted by cyclical sector beta
                double beta = getSectorBeta(asset.getSector(), interestRateShock);
                double equityAssetShock = equityShock * beta;
                return Math.max(-0.95, equityAssetShock);
            }

            case DERIVATIVE: {
                // Derivatives: Asset specific risk factor pass-through
                String sector = asset.getSector().toUpperCase();
                if (sector.contains("FX") || asset.getCurrency().equals("EUR") || asset.getCurrency().equals("GBP")) {
                    return fxShock;
                } else if (sector.contains("COMMODITY") || asset.getAssetName().toLowerCase().contains("oil")) {
                    return commodityShock;
                } else if (sector.contains("BANKING") || asset.getAssetName().toLowerCase().contains("cds")) {
                    // CDS: Credit protection payoff increases as spreads widen
                    double cdsSpreadFactor = (spreadShockBps / 10000.0) * 4.0;
                    return cdsSpreadFactor;
                } else {
                    // Equity index futures or broad market derivatives
                    return equityShock;
                }
            }

            default:
                return -0.05;
        }
    }

    private double getSectorBeta(String sector, double interestRateShock) {
        String s = sector != null ? sector.toUpperCase() : "";
        if (s.contains("TECH")) return 1.30;
        if (s.contains("AUTO")) return 1.40;
        if (s.contains("REAL ESTATE")) return 1.25 + (interestRateShock * 5.0);
        if (s.contains("BANKING")) return 1.20;
        if (s.contains("GOVERNMENT")) return 0.50;
        return 1.00;
    }

    public StressTestSummaryResponseDto mapToDto(
            StressTestResult result,
            Map<String, Double> assetClassPnl,
            Map<String, Double> sectorPnl,
            Double var95,
            Double var99,
            String worstHitAsset,
            Double worstHitLoss) {

        StressTestSummaryResponseDto dto = new StressTestSummaryResponseDto();
        dto.setId(result.getId());
        dto.setTriggerSignalId(result.getTriggerSignalId());
        dto.setEventType(result.getEventType());
        dto.setScenarioName(result.getScenarioName());
        dto.setPortfolioValueBefore(result.getPortfolioValueBefore());
        dto.setPortfolioValueAfter(result.getPortfolioValueAfter());
        dto.setTotalPnlImpact(result.getTotalPnlImpact());
        dto.setPercentageChange(result.getPercentageChange());
        dto.setExecutedAt(result.getExecutedAt());

        List<StressTestAssetDetailDto> detailDtos = new ArrayList<>();
        String calculatedWorstAsset = worstHitAsset;
        double maxLoss = worstHitLoss != null ? worstHitLoss : 0.0;

        Map<String, Double> acPnl = assetClassPnl != null ? new HashMap<>(assetClassPnl) : new HashMap<>();
        Map<String, Double> sPnl = sectorPnl != null ? new HashMap<>(sectorPnl) : new HashMap<>();

        if (result.getAssetDetails() != null) {
            for (StressTestAssetDetail d : result.getAssetDetails()) {
                double pct = d.getValueBefore() > 0 ? (d.getPnlImpact() / d.getValueBefore()) * 100.0 : 0.0;
                detailDtos.add(new StressTestAssetDetailDto(
                        d.getId(),
                        d.getAssetId(),
                        d.getAssetName(),
                        d.getAssetType(),
                        d.getValueBefore(),
                        d.getValueAfter(),
                        d.getPnlImpact(),
                        d.getShockApplied(),
                        round(pct)
                ));

                if (assetClassPnl == null) {
                    acPnl.put(d.getAssetType(), round(acPnl.getOrDefault(d.getAssetType(), 0.0) + d.getPnlImpact()));
                }
                if (d.getPnlImpact() < maxLoss) {
                    maxLoss = d.getPnlImpact();
                    calculatedWorstAsset = d.getAssetName();
                }
            }
        }
        dto.setAssetDetails(detailDtos);
        dto.setAssetClassPnl(acPnl);
        dto.setSectorPnl(sPnl);

        double totalVal = result.getPortfolioValueBefore();
        double pctChange = result.getPercentageChange();
        double impliedStressVolatility = Math.abs(pctChange) / 100.0 * 0.40 + 0.015;
        double calcVar95 = round(1.645 * impliedStressVolatility * totalVal);
        double calcVar99 = round(2.326 * impliedStressVolatility * totalVal);

        dto.setValueAtRisk95(var95 != null ? var95 : calcVar95);
        dto.setValueAtRisk99(var99 != null ? var99 : calcVar99);
        dto.setWorstHitAsset(calculatedWorstAsset);
        dto.setWorstHitAssetPnl(round(maxLoss));

        return dto;
    }

    private double toDouble(Object obj) {
        if (obj == null) return 0.0;
        if (obj instanceof Number num) return num.doubleValue();
        try {
            return Double.parseDouble(obj.toString());
        } catch (NumberFormatException e) {
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
