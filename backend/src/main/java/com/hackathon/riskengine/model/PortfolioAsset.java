package com.hackathon.riskengine.model;

import jakarta.persistence.*;

@Entity
@Table(name = "portfolio_assets")
public class PortfolioAsset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String assetName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AssetType assetType;

    @Column(nullable = false)
    private Double notionalValue; // In millions ($M)

    @Column
    private Double interestRate; // Annual % coupon/rate (e.g. 5.2 for 5.2%)

    @Column
    private Double duration; // Modified duration in years for fixed income

    @Column(nullable = false, length = 50)
    private String sector;

    @Column(nullable = false, length = 10)
    private String currency; // USD, EUR, etc.

    public PortfolioAsset() {
    }

    public PortfolioAsset(String assetName, AssetType assetType, Double notionalValue,
                          Double interestRate, Double duration, String sector, String currency) {
        this.assetName = assetName;
        this.assetType = assetType;
        this.notionalValue = notionalValue;
        this.interestRate = interestRate;
        this.duration = duration;
        this.sector = sector;
        this.currency = currency;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAssetName() {
        return assetName;
    }

    public void setAssetName(String assetName) {
        this.assetName = assetName;
    }

    public AssetType getAssetType() {
        return assetType;
    }

    public void setAssetType(AssetType assetType) {
        this.assetType = assetType;
    }

    public Double getNotionalValue() {
        return notionalValue;
    }

    public void setNotionalValue(Double notionalValue) {
        this.notionalValue = notionalValue;
    }

    public Double getInterestRate() {
        return interestRate;
    }

    public void setInterestRate(Double interestRate) {
        this.interestRate = interestRate;
    }

    public Double getDuration() {
        return duration;
    }

    public void setDuration(Double duration) {
        this.duration = duration;
    }

    public String getSector() {
        return sector;
    }

    public void setSector(String sector) {
        this.sector = sector;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }
}
