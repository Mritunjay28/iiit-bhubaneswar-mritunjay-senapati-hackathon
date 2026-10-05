package com.hackathon.riskengine.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "stress_test_results")
public class StressTestResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private Long triggerSignalId; // ID of the RiskSignal that triggered this test (if auto-triggered)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private EventType eventType;

    @Column(nullable = false, length = 150)
    private String scenarioName;

    @Column(nullable = false)
    private Double portfolioValueBefore;

    @Column(nullable = false)
    private Double portfolioValueAfter;

    @Column(nullable = false)
    private Double totalPnlImpact;

    @Column(nullable = false)
    private Double percentageChange;

    @Column(nullable = false)
    private LocalDateTime executedAt;

    @OneToMany(mappedBy = "stressTestResult", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<StressTestAssetDetail> assetDetails = new ArrayList<>();

    public StressTestResult() {
    }

    public StressTestResult(Long triggerSignalId, EventType eventType, String scenarioName,
                            Double portfolioValueBefore, Double portfolioValueAfter,
                            Double totalPnlImpact, Double percentageChange,
                            LocalDateTime executedAt) {
        this.triggerSignalId = triggerSignalId;
        this.eventType = eventType;
        this.scenarioName = scenarioName;
        this.portfolioValueBefore = portfolioValueBefore;
        this.portfolioValueAfter = portfolioValueAfter;
        this.totalPnlImpact = totalPnlImpact;
        this.percentageChange = percentageChange;
        this.executedAt = executedAt != null ? executedAt : LocalDateTime.now();
    }

    public void addAssetDetail(StressTestAssetDetail detail) {
        assetDetails.add(detail);
        detail.setStressTestResult(this);
    }

    // Getters and Setters
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

    public List<StressTestAssetDetail> getAssetDetails() {
        return assetDetails;
    }

    public void setAssetDetails(List<StressTestAssetDetail> assetDetails) {
        this.assetDetails = assetDetails;
        if (assetDetails != null) {
            for (StressTestAssetDetail detail : assetDetails) {
                detail.setStressTestResult(this);
            }
        }
    }

    @PrePersist
    protected void onCreate() {
        if (this.executedAt == null) {
            this.executedAt = LocalDateTime.now();
        }
    }
}
