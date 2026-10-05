package com.hackathon.riskengine.dto;

import java.util.HashMap;
import java.util.Map;

public class SignalStatsDto {

    private long totalSignals;
    private long triggeredStressTests;
    private Double averageSentiment;
    private Map<String, Long> eventTypeDistribution = new HashMap<>();
    private Map<Integer, Long> impactDistribution = new HashMap<>();
    private Map<String, Long> sourceDistribution = new HashMap<>();

    public SignalStatsDto() {
    }

    public long getTotalSignals() {
        return totalSignals;
    }

    public void setTotalSignals(long totalSignals) {
        this.totalSignals = totalSignals;
    }

    public long getTriggeredStressTests() {
        return triggeredStressTests;
    }

    public void setTriggeredStressTests(long triggeredStressTests) {
        this.triggeredStressTests = triggeredStressTests;
    }

    public Double getAverageSentiment() {
        return averageSentiment;
    }

    public void setAverageSentiment(Double averageSentiment) {
        this.averageSentiment = averageSentiment;
    }

    public Map<String, Long> getEventTypeDistribution() {
        return eventTypeDistribution;
    }

    public void setEventTypeDistribution(Map<String, Long> eventTypeDistribution) {
        this.eventTypeDistribution = eventTypeDistribution;
    }

    public Map<Integer, Long> getImpactDistribution() {
        return impactDistribution;
    }

    public void setImpactDistribution(Map<Integer, Long> impactDistribution) {
        this.impactDistribution = impactDistribution;
    }

    public Map<String, Long> getSourceDistribution() {
        return sourceDistribution;
    }

    public void setSourceDistribution(Map<String, Long> sourceDistribution) {
        this.sourceDistribution = sourceDistribution;
    }
}
