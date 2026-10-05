package com.hackathon.riskengine.dto;

import com.hackathon.riskengine.model.EventType;

public class ShockScenarioDto {

    private String scenarioName;
    private EventType eventType;
    private String description;
    private Double equityShock = 0.0;
    private Double interestRateShock = 0.0;
    private Double creditSpreadShockBps = 0.0;
    private Double fxShock = 0.0;
    private Double commodityShock = 0.0;

    public ShockScenarioDto() {
    }

    public ShockScenarioDto(String scenarioName, EventType eventType, String description,
                            Double equityShock, Double interestRateShock, Double creditSpreadShockBps,
                            Double fxShock, Double commodityShock) {
        this.scenarioName = scenarioName;
        this.eventType = eventType;
        this.description = description;
        this.equityShock = equityShock;
        this.interestRateShock = interestRateShock;
        this.creditSpreadShockBps = creditSpreadShockBps;
        this.fxShock = fxShock;
        this.commodityShock = commodityShock;
    }

    public String getScenarioName() {
        return scenarioName;
    }

    public void setScenarioName(String scenarioName) {
        this.scenarioName = scenarioName;
    }

    public EventType getEventType() {
        return eventType;
    }

    public void setEventType(EventType eventType) {
        this.eventType = eventType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getEquityShock() {
        return equityShock;
    }

    public void setEquityShock(Double equityShock) {
        this.equityShock = equityShock;
    }

    public Double getInterestRateShock() {
        return interestRateShock;
    }

    public void setInterestRateShock(Double interestRateShock) {
        this.interestRateShock = interestRateShock;
    }

    public Double getCreditSpreadShockBps() {
        return creditSpreadShockBps;
    }

    public void setCreditSpreadShockBps(Double creditSpreadShockBps) {
        this.creditSpreadShockBps = creditSpreadShockBps;
    }

    public Double getFxShock() {
        return fxShock;
    }

    public void setFxShock(Double fxShock) {
        this.fxShock = fxShock;
    }

    public Double getCommodityShock() {
        return commodityShock;
    }

    public void setCommodityShock(Double commodityShock) {
        this.commodityShock = commodityShock;
    }
}
