package com.hackathon.riskengine.dto;

public class StressTestAssetDetailDto {

    private Long id;
    private Long assetId;
    private String assetName;
    private String assetType;
    private Double valueBefore;
    private Double valueAfter;
    private Double pnlImpact;
    private Double shockApplied;
    private Double percentageChange;

    public StressTestAssetDetailDto() {
    }

    public StressTestAssetDetailDto(Long id, Long assetId, String assetName, String assetType,
                                    Double valueBefore, Double valueAfter, Double pnlImpact,
                                    Double shockApplied, Double percentageChange) {
        this.id = id;
        this.assetId = assetId;
        this.assetName = assetName;
        this.assetType = assetType;
        this.valueBefore = valueBefore;
        this.valueAfter = valueAfter;
        this.pnlImpact = pnlImpact;
        this.shockApplied = shockApplied;
        this.percentageChange = percentageChange;
    }

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

    public Double getPercentageChange() {
        return percentageChange;
    }

    public void setPercentageChange(Double percentageChange) {
        this.percentageChange = percentageChange;
    }
}
