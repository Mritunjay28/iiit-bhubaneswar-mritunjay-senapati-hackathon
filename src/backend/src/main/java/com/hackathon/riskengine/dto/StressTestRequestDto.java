package com.hackathon.riskengine.dto;

import com.hackathon.riskengine.model.EventType;

public class StressTestRequestDto {

    private String scenarioName;
    private EventType eventType;
    private Long triggerSignalId;

    // Optional override parameters; if null, defaults from shock scenario are used
    private Double equityShock;
    private Double interestRateShock;
    private Double creditSpreadShockBps;
    private Double fxShock;
    private Double commodityShock;

    public StressTestRequestDto() {
    }

    public StressTestRequestDto(String scenarioName, EventType eventType) {
        this.scenarioName = scenarioName;
        this.eventType = eventType;
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

    public Long getTriggerSignalId() {
        return triggerSignalId;
    }

    public void setTriggerSignalId(Long triggerSignalId) {
        this.triggerSignalId = triggerSignalId;
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
