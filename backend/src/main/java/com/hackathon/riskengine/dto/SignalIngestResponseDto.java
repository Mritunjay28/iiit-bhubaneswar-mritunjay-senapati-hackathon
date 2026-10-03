package com.hackathon.riskengine.dto;

import com.hackathon.riskengine.model.RiskSignal;

public class SignalIngestResponseDto {

    private RiskSignal signal;
    private boolean stressTestTriggered;
    private StressTestSummaryResponseDto stressTestResult;
    private String message;

    public SignalIngestResponseDto() {
    }

    public SignalIngestResponseDto(RiskSignal signal, boolean stressTestTriggered,
                                   StressTestSummaryResponseDto stressTestResult, String message) {
        this.signal = signal;
        this.stressTestTriggered = stressTestTriggered;
        this.stressTestResult = stressTestResult;
        this.message = message;
    }

    public RiskSignal getSignal() {
        return signal;
    }

    public void setSignal(RiskSignal signal) {
        this.signal = signal;
    }

    public boolean isStressTestTriggered() {
        return stressTestTriggered;
    }

    public void setStressTestTriggered(boolean stressTestTriggered) {
        this.stressTestTriggered = stressTestTriggered;
    }

    public StressTestSummaryResponseDto getStressTestResult() {
        return stressTestResult;
    }

    public void setStressTestResult(StressTestSummaryResponseDto stressTestResult) {
        this.stressTestResult = stressTestResult;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
