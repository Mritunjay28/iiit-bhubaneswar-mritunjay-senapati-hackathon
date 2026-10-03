package com.hackathon.riskengine.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class SentimentDistributionDto {

    private Double positive = 0.0;
    private Double negative = 0.0;
    private Double neutral = 0.0;

    public SentimentDistributionDto() {
    }

    public SentimentDistributionDto(Double positive, Double negative, Double neutral) {
        this.positive = positive;
        this.negative = negative;
        this.neutral = neutral;
    }

    public Double getPositive() {
        return positive;
    }

    public void setPositive(Double positive) {
        this.positive = positive;
    }

    public Double getNegative() {
        return negative;
    }

    public void setNegative(Double negative) {
        this.negative = negative;
    }

    public Double getNeutral() {
        return neutral;
    }

    public void setNeutral(Double neutral) {
        this.neutral = neutral;
    }
}
