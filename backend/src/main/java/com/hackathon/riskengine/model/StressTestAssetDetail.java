package com.hackathon.riskengine.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "stress_test_asset_details")
public class StressTestAssetDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long assetId;

    @Column(nullable = false, length = 100)
    private String assetName;

    @Column(nullable = false, length = 30)
    private String assetType;

    @Column(nullable = false)
    private Double valueBefore;

    @Column(nullable = false)
    private Double valueAfter;

    @Column(nullable = false)
    private Double pnlImpact;

    @Column(nullable = false)
    private Double shockApplied;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stress_test_result_id")
    @JsonIgnore
    private StressTestResult stressTestResult;

    public StressTestAssetDetail() {
    }

    public StressTestAssetDetail(Long assetId, String assetName, String assetType,
                                 Double valueBefore, Double valueAfter, Double pnlImpact,
                                 Double shockApplied) {
        this.assetId = assetId;
        this.assetName = assetName;
        this.assetType = assetType;
        this.valueBefore = valueBefore;
        this.valueAfter = valueAfter;
        this.pnlImpact = pnlImpact;
        this.shockApplied = shockApplied;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAssetId() {
        return assetId;
    }

    public void setAssetId(Long assetId) {
        this.assetId = assetId;
    }

    public String getAssetName() {
        return assetName;
    }

    public void setAssetName(String assetName) {
        this.assetName = assetName;
    }

    public String getAssetType() {
        return assetType;
    }

    public void setAssetType(String assetType) {
        this.assetType = assetType;
    }

    public Double getValueBefore() {
        return valueBefore;
    }

    public void setValueBefore(Double valueBefore) {
        this.valueBefore = valueBefore;
    }

    public Double getValueAfter() {
        return valueAfter;
    }

    public void setValueAfter(Double valueAfter) {
        this.valueAfter = valueAfter;
    }

    public Double getPnlImpact() {
        return pnlImpact;
    }

    public void setPnlImpact(Double pnlImpact) {
        this.pnlImpact = pnlImpact;
    }

    public Double getShockApplied() {
        return shockApplied;
    }

    public void setShockApplied(Double shockApplied) {
        this.shockApplied = shockApplied;
    }

    public StressTestResult getStressTestResult() {
        return stressTestResult;
    }

    public void setStressTestResult(StressTestResult stressTestResult) {
        this.stressTestResult = stressTestResult;
    }
}
