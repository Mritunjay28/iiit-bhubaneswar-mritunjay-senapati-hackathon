package com.hackathon.riskengine.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class AnalysisResponseDto {

    @JsonProperty("sentiment_score")
    private Double sentimentScore;

    @JsonProperty("sentiment_label")
    private String sentimentLabel;

    @JsonProperty("event_type")
    private String eventType;

    @JsonProperty("impact_score")
    private Integer impactScore;

    @JsonProperty("confidence")
    private Double confidence;

    @JsonProperty("entities")
    private List<String> entities = new ArrayList<>();

    @JsonProperty("raw_text")
    private String rawText;

    @JsonProperty("source")
    private String source;

    @JsonProperty("stress_test_suggested")
    private Boolean stressTestSuggested;

    @JsonProperty("distribution")
    private SentimentDistributionDto distribution;

    public AnalysisResponseDto() {
    }

    public Double getSentimentScore() {
        return sentimentScore;
    }

    public void setSentimentScore(Double sentimentScore) {
        this.sentimentScore = sentimentScore;
    }

    public String getSentimentLabel() {
        return sentimentLabel;
    }

    public void setSentimentLabel(String sentimentLabel) {
        this.sentimentLabel = sentimentLabel;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public Integer getImpactScore() {
        return impactScore;
    }

    public void setImpactScore(Integer impactScore) {
        this.impactScore = impactScore;
    }

    public Double getConfidence() {
        return confidence;
    }

    public void setConfidence(Double confidence) {
        this.confidence = confidence;
    }

    public List<String> getEntities() {
        return entities;
    }

    public void setEntities(List<String> entities) {
        this.entities = entities;
    }

    public String getRawText() {
        return rawText;
    }

    public void setRawText(String rawText) {
        this.rawText = rawText;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public Boolean getStressTestSuggested() {
        return stressTestSuggested;
    }

    public void setStressTestSuggested(Boolean stressTestSuggested) {
        this.stressTestSuggested = stressTestSuggested;
    }

    public SentimentDistributionDto getDistribution() {
        return distribution;
    }

    public void setDistribution(SentimentDistributionDto distribution) {
        this.distribution = distribution;
    }
}
