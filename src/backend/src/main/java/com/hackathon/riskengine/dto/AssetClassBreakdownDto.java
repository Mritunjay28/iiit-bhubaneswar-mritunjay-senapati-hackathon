package com.hackathon.riskengine.dto;

import com.hackathon.riskengine.model.AssetType;

public class AssetClassBreakdownDto {

    private AssetType assetType;
    private long count;
    private Double totalNotional;
    private Double percentage;

    public AssetClassBreakdownDto() {
    }

    public AssetClassBreakdownDto(AssetType assetType, long count, Double totalNotional, Double percentage) {
        this.assetType = assetType;
        this.count = count;
        this.totalNotional = totalNotional;
        this.percentage = percentage;
    }

    public AssetType getAssetType() {
        return assetType;
    }

    public void setAssetType(AssetType assetType) {
        this.assetType = assetType;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }

    public Double getTotalNotional() {
        return totalNotional;
    }

    public void setTotalNotional(Double totalNotional) {
        this.totalNotional = totalNotional;
    }

    public Double getPercentage() {
        return percentage;
    }

    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }
}
