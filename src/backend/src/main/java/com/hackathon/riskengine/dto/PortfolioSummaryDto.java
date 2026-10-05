package com.hackathon.riskengine.dto;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class PortfolioSummaryDto {

    private Double totalNotionalValue = 0.0; // In Millions ($M)
    private int totalAssetCount = 0;
    private List<AssetClassBreakdownDto> assetClassBreakdown = new ArrayList<>();
    private List<SectorBreakdownDto> sectorBreakdown = new ArrayList<>();
    private Map<String, Double> currencyAllocation = new HashMap<>();
    private Double portfolioWeightedDuration = 0.0;
    private Double averageCouponRate = 0.0;

    public PortfolioSummaryDto() {
    }

    public Double getTotalNotionalValue() {
        return totalNotionalValue;
    }

    public void setTotalNotionalValue(Double totalNotionalValue) {
        this.totalNotionalValue = totalNotionalValue;
    }

    public int getTotalAssetCount() {
        return totalAssetCount;
    }

    public void setTotalAssetCount(int totalAssetCount) {
        this.totalAssetCount = totalAssetCount;
    }

    public List<AssetClassBreakdownDto> getAssetClassBreakdown() {
        return assetClassBreakdown;
    }

    public void setAssetClassBreakdown(List<AssetClassBreakdownDto> assetClassBreakdown) {
        this.assetClassBreakdown = assetClassBreakdown;
    }

    public List<SectorBreakdownDto> getSectorBreakdown() {
        return sectorBreakdown;
    }

    public void setSectorBreakdown(List<SectorBreakdownDto> sectorBreakdown) {
        this.sectorBreakdown = sectorBreakdown;
    }

    public Map<String, Double> getCurrencyAllocation() {
        return currencyAllocation;
    }

    public void setCurrencyAllocation(Map<String, Double> currencyAllocation) {
        this.currencyAllocation = currencyAllocation;
    }

    public Double getPortfolioWeightedDuration() {
        return portfolioWeightedDuration;
    }

    public void setPortfolioWeightedDuration(Double portfolioWeightedDuration) {
        this.portfolioWeightedDuration = portfolioWeightedDuration;
    }

    public Double getAverageCouponRate() {
        return averageCouponRate;
    }

    public void setAverageCouponRate(Double averageCouponRate) {
        this.averageCouponRate = averageCouponRate;
    }
}
