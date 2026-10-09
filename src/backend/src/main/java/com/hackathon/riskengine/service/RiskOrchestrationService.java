package com.hackathon.riskengine.service;

import com.hackathon.riskengine.dto.*;
import com.hackathon.riskengine.model.EventType;
import com.hackathon.riskengine.model.RiskSignal;
import com.hackathon.riskengine.repository.RiskSignalRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class RiskOrchestrationService {

    private static final Logger logger = LoggerFactory.getLogger(RiskOrchestrationService.class);

    private final NlpServiceClient nlpServiceClient;
    private final StressTestEngineService stressTestEngineService;
    private final RiskSignalRepository riskSignalRepository;
    private final int highImpactThreshold;

    public RiskOrchestrationService(
            NlpServiceClient nlpServiceClient,
            StressTestEngineService stressTestEngineService,
            RiskSignalRepository riskSignalRepository,
            @Value("${riskengine.stress-test.high-impact-threshold:7}") int highImpactThreshold) {
        this.nlpServiceClient = nlpServiceClient;
        this.stressTestEngineService = stressTestEngineService;
        this.riskSignalRepository = riskSignalRepository;
        this.highImpactThreshold = highImpactThreshold;
        logger.info("RiskOrchestrationService configured with High Impact Threshold: {}", this.highImpactThreshold);
    }

    /**
     * Primary Orchestration Pipeline:
     * Unstructured Text -> NLP FinBERT & Classifier -> Signal Persistence -> Auto Stress Testing
     */
    @Transactional
    public SignalIngestResponseDto ingestAndEvaluate(String text, String source, String entity) {
        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException("Text content cannot be null or empty");
        }

        String effectiveSource = (source != null && !source.isBlank()) ? source : "CUSTOM";

        // Step 1: Run through NLP Service (or resilient fallback)
        AnalysisResponseDto analysis = nlpServiceClient.analyzeText(text, effectiveSource, entity);

        EventType eventType;
        try {
            eventType = EventType.valueOf(analysis.getEventType());
        } catch (Exception e) {
            eventType = EventType.MACROECONOMIC;
        }

        int impactScore = analysis.getImpactScore();
        boolean shouldTrigger = impactScore >= highImpactThreshold && !"SYSTEM".equalsIgnoreCase(effectiveSource);

        String extractedEntity = entity;
        if ((extractedEntity == null || extractedEntity.isBlank()) && analysis.getEntities() != null && !analysis.getEntities().isEmpty()) {
            extractedEntity = analysis.getEntities().get(0);
        }

        // Step 2: Persist RiskSignal to Database
        RiskSignal signal = new RiskSignal(
                effectiveSource,
                text,
                extractedEntity,
                analysis.getSentimentScore(),
                eventType,
                impactScore,
                LocalDateTime.now(),
                shouldTrigger
        );

        RiskSignal savedSignal = riskSignalRepository.save(signal);

        StressTestSummaryResponseDto stressTestResult = null;
        String message;

        // Step 3: Auto-Trigger Portfolio Stress Test if Impact >= Threshold
        if (shouldTrigger) {
            logger.warn("🚨 HIGH IMPACT RISK SIGNAL DETECTED (Score: {}/10 >= {}). Auto-triggering Strategic Stress Test for EventType: {}",
                    impactScore, highImpactThreshold, eventType);

            try {
                StressTestRequestDto testRequest = new StressTestRequestDto();
                testRequest.setTriggerSignalId(savedSignal.getId());
                testRequest.setEventType(eventType);
                testRequest.setScenarioName("Auto-Triggered: " + eventType.name() + " (" + effectiveSource + ")");

                stressTestResult = stressTestEngineService.executeStressTest(testRequest);
                message = "High-impact risk signal recorded. Portfolio stress test executed automatically with drawdown: "
                        + stressTestResult.getPercentageChange() + "%.";
            } catch (Exception e) {
                logger.error("Failed to execute auto-triggered stress test for signal #{}: {}", savedSignal.getId(), e.getMessage());
                message = "Risk signal recorded, but stress test execution encountered an error: " + e.getMessage();
            }
        } else {
            message = "Risk signal recorded (Impact: " + impactScore + "/10). Did not breach stress test threshold (" + highImpactThreshold + ").";
        }

        return new SignalIngestResponseDto(savedSignal, shouldTrigger, stressTestResult, message);
    }

    /**
     * Ingest batch of headlines or social posts.
     */
    @Transactional
    public List<SignalIngestResponseDto> ingestBatch(List<String> texts, String source) {
        List<SignalIngestResponseDto> responses = new ArrayList<>();
        if (texts == null || texts.isEmpty()) return responses;

        for (String text : texts) {
            if (text != null && !text.isBlank()) {
                responses.add(ingestAndEvaluate(text, source, null));
            }
        }
        return responses;
    }

    /**
     * Ingests live news from GDELT and processes them through the orchestration pipeline.
     */
    @Transactional
    public List<SignalIngestResponseDto> ingestGdeltNews(String query, Integer days, Integer maxRecords) {
        GdeltFetchResponseDto gdeltResponse = nlpServiceClient.fetchGdelt(query, days, maxRecords);
        List<SignalIngestResponseDto> results = new ArrayList<>();

        if (gdeltResponse.getArticles() != null) {
            for (AnalysisResponseDto article : gdeltResponse.getArticles()) {
                String ent = (article.getEntities() != null && !article.getEntities().isEmpty()) ? article.getEntities().get(0) : null;
                results.add(ingestAndEvaluate(article.getRawText(), "GDELT", ent));
            }
        }
        return results;
    }

    /**
     * Ingests tweets from CSV and processes them through the orchestration pipeline.
     */
    @Transactional
    public List<SignalIngestResponseDto> ingestTweets(String filePath, Integer limit) {
        TweetFetchResponseDto tweetResponse = nlpServiceClient.fetchTweets(filePath, limit);
        List<SignalIngestResponseDto> results = new ArrayList<>();

        if (tweetResponse.getResults() != null) {
            for (TweetRecordResponseDto record : tweetResponse.getResults()) {
                results.add(ingestAndEvaluate(record.getText(), "TWITTER", record.getTicker()));
            }
        }
        return results;
    }

    public List<RiskSignal> getAllSignals() {
        return riskSignalRepository.findAll();
    }

    public Page<RiskSignal> getSignals(EventType eventType, String source, Integer minImpact, int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        if (eventType != null) {
            List<RiskSignal> list = riskSignalRepository.findByEventTypeOrderByTimestampDesc(eventType);
            return new org.springframework.data.domain.PageImpl<>(list, pageable, list.size());
        }
        if (source != null && !source.isBlank()) {
            List<RiskSignal> list = riskSignalRepository.findBySourceOrderByTimestampDesc(source);
            return new org.springframework.data.domain.PageImpl<>(list, pageable, list.size());
        }
        if (minImpact != null && minImpact > 0) {
            List<RiskSignal> list = riskSignalRepository.findByImpactScoreGreaterThanEqualOrderByTimestampDesc(minImpact);
            return new org.springframework.data.domain.PageImpl<>(list, pageable, list.size());
        }
        return riskSignalRepository.findAllByOrderByTimestampDesc(pageable);
    }

    public List<RiskSignal> getLatestSignals() {
        return riskSignalRepository.findTop10ByOrderByTimestampDesc();
    }

    /**
     * Computes analytical breakdown of all ingested signals.
     */
    public SignalStatsDto getSignalStats() {
        SignalStatsDto stats = new SignalStatsDto();
        stats.setTotalSignals(riskSignalRepository.count());
        stats.setTriggeredStressTests(riskSignalRepository.countByStressTestTriggeredTrue());

        Double avgSent = riskSignalRepository.getAverageSentimentScore();
        stats.setAverageSentiment(avgSent != null ? Math.round(avgSent * 100.0) / 100.0 : 0.0);

        // Event type distribution
        Map<String, Long> eventMap = new LinkedHashMap<>();
        for (Object[] row : riskSignalRepository.getEventTypeDistribution()) {
            EventType type = (EventType) row[0];
            Long count = (Long) row[1];
            eventMap.put(type.name(), count);
        }
        stats.setEventTypeDistribution(eventMap);

        // Impact distribution
        Map<Integer, Long> impactMap = new LinkedHashMap<>();
        for (Object[] row : riskSignalRepository.getImpactScoreDistribution()) {
            Integer score = (Integer) row[0];
            Long count = (Long) row[1];
            impactMap.put(score, count);
        }
        stats.setImpactDistribution(impactMap);

        // Source distribution
        Map<String, Long> sourceMap = new LinkedHashMap<>();
        for (Object[] row : riskSignalRepository.getSourceDistribution()) {
            String src = (String) row[0];
            Long count = (Long) row[1];
            sourceMap.put(src, count);
        }
        stats.setSourceDistribution(sourceMap);

        return stats;
    }
}
