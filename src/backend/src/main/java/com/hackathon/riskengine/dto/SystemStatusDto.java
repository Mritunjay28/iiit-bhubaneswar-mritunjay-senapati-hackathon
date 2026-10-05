package com.hackathon.riskengine.dto;

import java.time.LocalDateTime;

public class SystemStatusDto {

    private String status = "UP";
    private String environment = "production";
    private long assetCount;
    private long signalCount;
    private long stressTestCount;
    private Double totalPortfolioNotional;
    private boolean nlpServiceOnline;
    private String nlpServiceUrl;
    private LocalDateTime timestamp = LocalDateTime.now();

    public SystemStatusDto() {
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getEnvironment() {
        return environment;
    }

    public void setEnvironment(String environment) {
        this.environment = environment;
    }

    public long getAssetCount() {
        return assetCount;
    }

    public void setAssetCount(long assetCount) {
        this.assetCount = assetCount;
    }

    public long getSignalCount() {
        return signalCount;
    }

    public void setSignalCount(long signalCount) {
        this.signalCount = signalCount;
    }

    public long getStressTestCount() {
        return stressTestCount;
    }

    public void setStressTestCount(long stressTestCount) {
        this.stressTestCount = stressTestCount;
    }

    public Double getTotalPortfolioNotional() {
        return totalPortfolioNotional;
    }

    public void setTotalPortfolioNotional(Double totalPortfolioNotional) {
        this.totalPortfolioNotional = totalPortfolioNotional;
    }

    public boolean isNlpServiceOnline() {
        return nlpServiceOnline;
    }

    public void setNlpServiceOnline(boolean nlpServiceOnline) {
        this.nlpServiceOnline = nlpServiceOnline;
    }

    public String getNlpServiceUrl() {
        return nlpServiceUrl;
    }

    public void setNlpServiceUrl(String nlpServiceUrl) {
        this.nlpServiceUrl = nlpServiceUrl;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
