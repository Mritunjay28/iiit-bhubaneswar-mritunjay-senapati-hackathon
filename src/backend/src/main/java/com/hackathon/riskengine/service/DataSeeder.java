package com.hackathon.riskengine.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hackathon.riskengine.dto.AnalysisResponseDto;
import com.hackathon.riskengine.dto.StressTestRequestDto;
import com.hackathon.riskengine.model.EventType;
import com.hackathon.riskengine.model.RiskSignal;
import com.hackathon.riskengine.repository.PortfolioAssetRepository;
import com.hackathon.riskengine.repository.RiskSignalRepository;
import com.hackathon.riskengine.repository.StressTestResultRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Component
@Order(1)
public class DataSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataSeeder.class);

    private final PortfolioService portfolioService;
    private final PortfolioAssetRepository portfolioAssetRepository;
    private final RiskSignalRepository riskSignalRepository;
    private final StressTestResultRepository stressTestResultRepository;
    private final StressTestEngineService stressTestEngineService;
    private final NlpServiceClient nlpServiceClient;
    private final ObjectMapper objectMapper;

    public DataSeeder(
            PortfolioService portfolioService,
            PortfolioAssetRepository portfolioAssetRepository,
            RiskSignalRepository riskSignalRepository,
            StressTestResultRepository stressTestResultRepository,
            StressTestEngineService stressTestEngineService,
            NlpServiceClient nlpServiceClient,
            ObjectMapper objectMapper) {
        this.portfolioService = portfolioService;
        this.portfolioAssetRepository = portfolioAssetRepository;
        this.riskSignalRepository = riskSignalRepository;
        this.stressTestResultRepository = stressTestResultRepository;
        this.stressTestEngineService = stressTestEngineService;
        this.nlpServiceClient = nlpServiceClient;
        this.objectMapper = objectMapper;
    }

    @Override
    public void run(String... args) {
        logger.info("Verifying database seed state...");

        // 1. Seed Portfolio Assets if empty
        if (portfolioAssetRepository.count() == 0) {
            logger.info("Portfolio table is empty. Seeding $585M synthetic portfolio assets...");
            portfolioService.seedSyntheticPortfolio();
        } else {
            logger.info("Portfolio already populated with {} assets.", portfolioAssetRepository.count());
        }

        // 2. Seed Baseline Historical Risk Signals if empty
        if (riskSignalRepository.count() == 0) {
            seedSampleNewsSignals();
        }

        // 3. Seed Baseline Stress Test if none exist
        if (stressTestResultRepository.count() == 0 && portfolioAssetRepository.count() > 0) {
            logger.info("Seeding initial baseline stress test run (Geopolitical Crisis)...");
            try {
                StressTestRequestDto request = new StressTestRequestDto();
                request.setEventType(EventType.GEOPOLITICAL);
                request.setScenarioName("Geopolitical Crisis (Baseline)");
                stressTestEngineService.executeStressTest(request);
            } catch (Exception e) {
                logger.warn("Could not execute baseline stress test during seed: {}", e.getMessage());
            }
        }

        logger.info("DataSeeder completed successfully.");
    }

    private void seedSampleNewsSignals() {
        try {
            List<Map<String, Object>> newsList = loadNewsData();
            if (!newsList.isEmpty()) {
                logger.info("Seeding {} initial sample news signals...", newsList.size());
                for (int i = 0; i < newsList.size(); i++) {
                    Map<String, Object> item = newsList.get(i);
                    String rawText = (String) item.get("rawText");
                    String source = (String) item.getOrDefault("source", "GDELT");
                    String entity = (String) item.get("entity");

                    AnalysisResponseDto analysis = nlpServiceClient.fallbackAnalyze(rawText, source, entity);
                    EventType eventType = EventType.valueOf(analysis.getEventType());
                    int impact = analysis.getImpactScore();
                    boolean triggered = impact >= 7;

                    RiskSignal signal = new RiskSignal(
                            source,
                            rawText,
                            entity,
                            analysis.getSentimentScore(),
                            eventType,
                            impact,
                            LocalDateTime.now().minusHours(newsList.size() - i),
                            triggered
                    );
                    riskSignalRepository.save(signal);
                }
                logger.info("Successfully seeded {} initial risk signals.", riskSignalRepository.count());
            } else {
                logger.info("No external sample_news.json found; database ready for dynamic news ingestion.");
            }
        } catch (Exception e) {
            logger.warn("Could not seed sample news: {}", e.getMessage());
        }
    }

    private List<Map<String, Object>> loadNewsData() {
        try {
            Path path = resolveDataFile("sample_news.json");
            if (Files.exists(path)) {
                return objectMapper.readValue(path.toFile(), new TypeReference<>() {});
            }
            try (var is = getClass().getClassLoader().getResourceAsStream("data/sample_news.json")) {
                if (is != null) {
                    return objectMapper.readValue(is, new TypeReference<>() {});
                }
            }
        } catch (Exception e) {
            logger.warn("Could not resolve sample_news.json: {}", e.getMessage());
        }
        return Collections.emptyList();
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
