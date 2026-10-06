package com.hackathon.riskengine.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hackathon.riskengine.dto.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.File;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class NlpServiceClient {

    private static final Logger logger = LoggerFactory.getLogger(NlpServiceClient.class);

    private final WebClient webClient;
    private final String baseUrl;
    private final int timeoutMs;
    private final ObjectMapper objectMapper;

    // Resilient Fallback Dictionaries (Loughran-McDonald / Financial Risk Lexicon)
    private static final Set<String> NEGATIVE_WORDS = Set.of(
            "default", "crisis", "recession", "loss", "crash", "downgrade", "collapse",
            "bankrupt", "inflation", "hike", "war", "conflict", "sanction", "decline",
            "deficit", "drop", "slump", "fraud", "risk", "warning", "distress", "fail"
    );

    private static final Set<String> POSITIVE_WORDS = Set.of(
            "profit", "growth", "record", "surge", "gain", "upgrade", "outperform",
            "recovery", "rally", "beat", "expansion", "dividend", "breakthrough", "success"
    );

    public NlpServiceClient(
            @Value("${riskengine.nlp.base-url:http://localhost:8000}") String baseUrl,
            @Value("${riskengine.nlp.timeout-ms:30000}") int timeoutMs,
            WebClient.Builder webClientBuilder,
            ObjectMapper objectMapper) {
        this.baseUrl = baseUrl.replaceAll("/+$", "");
        this.timeoutMs = timeoutMs;
        this.objectMapper = objectMapper;
        this.webClient = webClientBuilder
                .baseUrl(this.baseUrl)
                .build();
        logger.info("Initialized NlpServiceClient with base URL: {} and timeout: {}ms", this.baseUrl, this.timeoutMs);
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    /**
     * Checks if the external Python NLP microservice is online.
     */
    public boolean isNlpServiceAvailable() {
        try {
            String response = webClient.get()
                    .uri("/health")
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofMillis(2500))
                    .block();
            return response != null && response.contains("ok");
        } catch (Exception e) {
            logger.debug("NLP microservice unreachable at {}: {}", baseUrl, e.getMessage());
            return false;
        }
    }

    /**
     * Analyzes single financial/macro text via Python FinBERT endpoint,
     * with transparent automatic rule-based fallback if microservice is offline.
     */
    public AnalysisResponseDto analyzeText(String text, String source, String entity) {
        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException("Text cannot be empty");
        }

        AnalysisRequestDto request = new AnalysisRequestDto(text, source, entity);

        try {
            logger.debug("Dispatching text to Python NLP service: {}", baseUrl + "/analyze");
            AnalysisResponseDto response = webClient.post()
                    .uri("/analyze")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(AnalysisResponseDto.class)
                    .timeout(Duration.ofMillis(timeoutMs))
                    .block();

            if (response != null) {
                return response;
            }
        } catch (Exception e) {
            logger.warn("NLP service call failed ({}). Switching to resilient local financial NLP fallback engine.", e.getMessage());
        }

        return fallbackAnalyze(text, source, entity);
    }

    /**
     * Batch analysis endpoint for high-throughput text streams.
     */
    public BatchAnalysisResponseDto analyzeBatch(List<String> texts, String source) {
        if (texts == null || texts.isEmpty()) {
            BatchAnalysisResponseDto empty = new BatchAnalysisResponseDto();
            empty.setTotal(0);
            return empty;
        }

        BatchAnalysisRequestDto request = new BatchAnalysisRequestDto(texts, source);

        try {
            BatchAnalysisResponseDto response = webClient.post()
                    .uri("/analyze/batch")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(BatchAnalysisResponseDto.class)
                    .timeout(Duration.ofMillis(timeoutMs))
                    .block();

            if (response != null) {
                return response;
            }
        } catch (Exception e) {
            logger.warn("NLP service batch call failed. Applying fallback analyzer across {} items.", texts.size());
        }

        List<AnalysisResponseDto> results = new ArrayList<>();
        for (String t : texts) {
            if (t != null && !t.isBlank()) {
                results.add(fallbackAnalyze(t, source, null));
            }
        }
        BatchAnalysisResponseDto fallbackResponse = new BatchAnalysisResponseDto();
        fallbackResponse.setTotal(results.size());
        fallbackResponse.setResults(results);
        return fallbackResponse;
    }

    /**
     * Fetches real-time financial news from GDELT 2.0 API via Python service,
     * or loads and scores curated local news if NLP service is unreachable.
     */
    public GdeltFetchResponseDto fetchGdelt(String query, Integer days, Integer maxRecords) {
        int d = (days != null && days > 0) ? days : 1;
        int m = (maxRecords != null && maxRecords > 0) ? maxRecords : 10;
        String q = (query != null && !query.isBlank()) ? query : "bank crisis OR interest rate OR default";

        try {
            GdeltFetchResponseDto response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/fetch/gdelt")
                            .queryParam("query", q)
                            .queryParam("days", d)
                            .queryParam("max_records", m)
                            .build())
                    .retrieve()
                    .bodyToMono(GdeltFetchResponseDto.class)
                    .timeout(Duration.ofMillis(timeoutMs))
                    .block();

            if (response != null) {
                return response;
            }
        } catch (Exception e) {
            logger.warn("GDELT fetch via NLP service failed ({}). Loading local sample news fallback.", e.getMessage());
        }

        return fallbackLoadNews(q, m);
    }

    /**
     * Loads social media tweets from CSV and scores them via NLP service,
     * or loads sample tweets fallback if service is unreachable.
     */
    public TweetFetchResponseDto fetchTweets(String filePath, Integer limit) {
        int lim = (limit != null && limit > 0) ? limit : 50;

        try {
            TweetFetchResponseDto response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/fetch/tweets")
                            .queryParam("limit", lim)
                            .build())
                    .retrieve()
                    .bodyToMono(TweetFetchResponseDto.class)
                    .timeout(Duration.ofMillis(timeoutMs))
                    .block();

            if (response != null) {
                return response;
            }
        } catch (Exception e) {
            logger.warn("Tweet fetch via NLP service failed ({}). Loading local sample tweets fallback.", e.getMessage());
        }

        return fallbackLoadTweets(filePath, lim);
    }

    // =========================================================================
    // Resilient Fallback Engines
    // =========================================================================

    /**
     * Deterministic, explainable Loughran-McDonald lexicon + Keyword Taxonomy fallback.
     */
    public AnalysisResponseDto fallbackAnalyze(String text, String source, String entity) {
        String lower = text.toLowerCase();

        // 1. Lexical Sentiment
        int negCount = 0;
        int posCount = 0;
        for (String w : NEGATIVE_WORDS) {
            if (lower.contains(w)) negCount++;
        }
        for (String w : POSITIVE_WORDS) {
            if (lower.contains(w)) posCount++;
        }

        double sentimentScore;
        String sentimentLabel;
        if (negCount > posCount) {
            sentimentScore = Math.max(-0.95, -0.25 * (negCount - posCount) - 0.20);
            sentimentLabel = "negative";
        } else if (posCount > negCount) {
            sentimentScore = Math.min(0.95, 0.25 * (posCount - negCount) + 0.20);
            sentimentLabel = "positive";
        } else {
            sentimentScore = 0.0;
            sentimentLabel = "neutral";
        }

        // 2. Keyword Taxonomy Classification (7 Categories)
        String eventType = classifyEventType(lower);

        // 3. Composite Impact Calculation (1-10 Scale)
        int impactScore = calculateImpactScore(sentimentScore, eventType, source);
        boolean stressTestSuggested = impactScore >= 7;

        // 4. Entity Extraction
        List<String> entities = extractEntities(text, entity);

        AnalysisResponseDto dto = new AnalysisResponseDto();
        dto.setRawText(text);
        dto.setSource(source != null ? source : "CUSTOM");
        dto.setSentimentScore(Math.round(sentimentScore * 100.0) / 100.0);
        dto.setSentimentLabel(sentimentLabel);
        dto.setEventType(eventType);
        dto.setImpactScore(impactScore);
        dto.setConfidence(0.85);
        dto.setEntities(entities);
        dto.setStressTestSuggested(stressTestSuggested);

        double posProb = sentimentLabel.equals("positive") ? 0.75 : 0.15;
        double negProb = sentimentLabel.equals("negative") ? 0.75 : 0.15;
        double neuProb = sentimentLabel.equals("neutral") ? 0.70 : 0.10;
        dto.setDistribution(new SentimentDistributionDto(posProb, negProb, neuProb));

        return dto;
    }

    private String classifyEventType(String lower) {
        if (matchesAny(lower, "war", "military", "sanction", "geopolitic", "border", "missile", "treaty", "nato", "defense", "tariff")) {
            return "GEOPOLITICAL";
        }
        if (matchesAny(lower, "interest rate", "inflation", "central bank", "federal reserve", "fed", "recession", "gdp", "cpi", "monetary policy", "unemployment")) {
            return "MACROECONOMIC";
        }
        if (matchesAny(lower, "default", "debt", "bond yield", "credit rating", "downgrade", "insolven", "liquidity", "bankruptcy", "credit spread", "cds")) {
            return "CREDIT_EVENT";
        }
        if (matchesAny(lower, "regulat", "sec", "doj", "investigat", "antitrust", "compliance", "lawsuit", "fine", "subpoena", "sanctions")) {
            return "REGULATORY";
        }
        if (matchesAny(lower, "merger", "acquisition", "buyout", "takeover", "deal", "stake", "m&a", "divestiture")) {
            return "MERGER_ACQUISITION";
        }
        if (matchesAny(lower, "earnings", "revenue", "quarterly", "profit margin", "guidance", "ebitda", "q1", "q2", "q3", "q4")) {
            return "EARNINGS";
        }
        if (matchesAny(lower, "launch", "product", "announc", "ai chip", "semiconductor", "model release", "feature", "unveil")) {
            return "PRODUCT_LAUNCH";
        }
        return "MACROECONOMIC";
    }

    private boolean matchesAny(String text, String... keywords) {
        for (String kw : keywords) {
            String regex = "\\b" + Pattern.quote(kw) + "\\b";
            if (Pattern.compile(regex, Pattern.CASE_INSENSITIVE).matcher(text).find()) {
                return true;
            }
        }
        return false;
    }

    private int calculateImpactScore(double sentimentScore, String eventType, String source) {
        double absSentiment = Math.abs(sentimentScore);

        double severityWeight = switch (eventType) {
            case "GEOPOLITICAL" -> 0.90;
            case "CREDIT_EVENT" -> 0.85;
            case "MACROECONOMIC" -> 0.80;
            case "REGULATORY" -> 0.60;
            case "MERGER_ACQUISITION" -> 0.50;
            case "EARNINGS" -> 0.40;
            case "PRODUCT_LAUNCH" -> 0.30;
            default -> 0.50;
        };

        double sourceWeight = (source != null && (source.equalsIgnoreCase("GDELT") || source.equalsIgnoreCase("NEWS") || source.equalsIgnoreCase("REUTERS")))
                ? 1.00 : 0.70;

        double raw = (0.35 * absSentiment + 0.35 * severityWeight + 0.30 * sourceWeight) * 10.0;
        int score = (int) Math.round(raw);
        return Math.max(1, Math.min(10, score));
    }

    private List<String> extractEntities(String text, String explicitEntity) {
        Set<String> entities = new LinkedHashSet<>();
        if (explicitEntity != null && !explicitEntity.isBlank()) {
            entities.add(explicitEntity);
        }

        // Detect cashtags e.g. $AAPL, $TSLA, $NVDA
        java.util.regex.Matcher m = Pattern.compile("\\$([A-Z]{1,5})\\b").matcher(text);
        while (m.find()) {
            entities.add(m.group(1));
        }

        // Standard financial institutions / entities
        String[] standard = {"Federal Reserve", "Treasury", "JPMorgan", "Apple", "Tesla", "NVIDIA", "Microsoft", "Goldman Sachs", "SEC", "DOJ"};
        for (String s : standard) {
            if (text.contains(s)) entities.add(s);
        }

        return new ArrayList<>(entities);
    }

    private GdeltFetchResponseDto fallbackLoadNews(String query, int maxRecords) {
        List<AnalysisResponseDto> articles = new ArrayList<>();
        try {
            Path path = resolveDataFile("sample_news.json");
            if (Files.exists(path)) {
                List<Map<String, Object>> newsList = objectMapper.readValue(path.toFile(), new TypeReference<>() {});
                for (Map<String, Object> item : newsList) {
                    if (articles.size() >= maxRecords) break;
                    String rawText = (String) item.get("rawText");
                    String src = (String) item.getOrDefault("source", "GDELT");
                    String ent = (String) item.get("entity");
                    articles.add(fallbackAnalyze(rawText, src, ent));
                }
            }
        } catch (Exception e) {
            logger.error("Error loading sample_news.json fallback: {}", e.getMessage());
        }

        GdeltFetchResponseDto resp = new GdeltFetchResponseDto();
        resp.setTotal(articles.size());
        resp.setQuery(query);
        resp.setArticles(articles);
        return resp;
    }

    private TweetFetchResponseDto fallbackLoadTweets(String customPath, int limit) {
        List<TweetRecordResponseDto> records = new ArrayList<>();
        try {
            Path path = (customPath != null && !customPath.isBlank()) ? Paths.get(customPath) : resolveDataFile("sample_tweets.csv");
            if (Files.exists(path)) {
                List<String> lines = Files.readAllLines(path);
                boolean header = true;
                for (String line : lines) {
                    if (records.size() >= limit) break;
                    if (header) {
                        header = false;
                        continue;
                    }
                    String[] parts = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
                    if (parts.length >= 4) {
                        String id = parts[0].trim();
                        String ticker = parts[1].trim();
                        String date = parts[2].trim();
                        String text = parts[3].trim().replaceAll("^\"|\"$", "");

                        AnalysisResponseDto analysis = fallbackAnalyze(text, "TWITTER", ticker);
                        TweetRecordResponseDto rec = new TweetRecordResponseDto();
                        rec.setTweetId(id);
                        rec.setTicker(ticker);
                        rec.setTimestamp(date);
                        rec.setText(text);
                        rec.setAnalysis(analysis);
                        records.add(rec);
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Error reading fallback sample_tweets.csv: {}", e.getMessage());
        }

        TweetFetchResponseDto resp = new TweetFetchResponseDto();
        resp.setTotal(records.size());
        resp.setResults(records);
        return resp;
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
