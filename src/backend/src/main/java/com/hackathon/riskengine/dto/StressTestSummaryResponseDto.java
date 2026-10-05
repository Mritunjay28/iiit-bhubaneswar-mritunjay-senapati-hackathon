package com.hackathon.riskengine.dto;

import com.hackathon.riskengine.model.EventType;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class StressTestSummaryResponseDto {

    private Long id;
    private Long triggerSignalId;
    private EventType eventType;
    private String scenarioName;
    private Double portfolioValueBefore;
    private Double portfolioValueAfter;
    private Double totalPnlImpact;
    private Double percentageChange;
    private LocalDateTime executedAt;

    private List<StressTestAssetDetailDto> assetDetails = new ArrayList<>();
    private Map<String, Double> assetClassPnl = new HashMap<>();
    private Map<String, Double> sectorPnl = new HashMap<>();

    // Quantitative Risk Metrics
    private Double valueAtRisk95; // 95% 1-day Parametric VaR
    private Double valueAtRisk99; // 99% 1-day Parametric VaR
    private String worstHitAsset;
    private Double worstHitAssetPnl;

    public StressTestSummaryResponseDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTriggerSignalId() {
        return triggerSignalId;
    }

    public void setTriggerSignalId(Long triggerSignalId) {
        this.triggerSignalId = triggerSignalId;
    }

    public EventType getEventType() {
        return eventType;
    }

    public void setEventType(EventType eventType) {
        this.eventType = eventType;
    }

    public String getScenarioName() {
        return scenarioName;
    }

    public void setScenarioName(String scenarioName) {
        this.scenarioName = scenarioName;
    }

    public Double getPortfolioValueBefore() {
        return portfolioValueBefore;
    }

    public void setPortfolioValueBefore(Double portfolioValueBefore) {
        this.portfolioValueBefore = portfolioValueBefore;
    }

    public Double getPortfolioValueAfter() {
        return portfolioValueAfter;
    }

    public void setPortfolioValueAfter(Double portfolioValueAfter) {
        this.portfolioValueAfter = portfolioValueAfter;
    }

    public Double getTotalPnlImpact() {
        return totalPnlImpact;
    }

    public void setTotalPnlImpact(Double totalPnlImpact) {
        this.totalPnlImpact = totalPnlImpact;
    }

    public Double getPercentageChange() {
        return percentageChange;
    }

    public void setPercentageChange(Double percentageChange) {
        this.percentageChange = percentageChange;
    }

    public LocalDateTime getExecutedAt() {
        return executedAt;
    }

    public void setExecutedAt(LocalDateTime executedAt) {
        this.executedAt = executedAt;
    }

    public List<StressTestAssetDetailDto> getAssetDetails() {
        return assetDetails;
    }

    public void setAssetDetails(List<StressTestAssetDetailDto> assetDetails) {
        this.assetDetails = assetDetails;
    }

    public Map<String, Double> getAssetClassPnl() {
        return assetClassPnl;
    }

    public void setAssetClassPnl(Map<String, Double> assetClassPnl) {
        this.assetClassPnl = assetClassPnl;
    }

    public Map<String, Double> getSectorPnl() {
        return sectorPnl;
    }

    public void setSectorPnl(Map<String, Double> sectorPnl) {
        this.sectorPnl = sectorPnl;
    }

    public Double getValueAtRisk95() {
        return valueAtRisk95;
    }

    public void setValueAtRisk95(Double valueAtRisk95) {
        this.valueAtRisk95 = valueAtRisk95;
    }

    public Double getValueAtRisk99() {
        return valueAtRisk99;
    }

    public void setValueAtRisk99(Double valueAtRisk99) {
        this.valueAtRisk99 = valueAtRisk99;
    }

    public String getWorstHitAsset() {
        return worstHitAsset;
    }

    public void setWorstHitAsset(String worstHitAsset) {
        this.worstHitAsset = worstHitAsset;
    }

    public Double getWorstHitAssetPnl() {
        return worstHitAssetPnl;
    }

    public void setWorstHitAssetPnl(Double worstHitAssetPnl) {
        this.worstHitAssetPnl = worstHitAssetPnl;
    }
}
