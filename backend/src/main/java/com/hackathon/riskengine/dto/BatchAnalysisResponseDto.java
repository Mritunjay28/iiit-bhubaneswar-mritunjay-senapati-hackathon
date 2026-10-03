package com.hackathon.riskengine.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.ArrayList;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class BatchAnalysisResponseDto {

    private int total;
    private List<AnalysisResponseDto> results = new ArrayList<>();

    public BatchAnalysisResponseDto() {
    }

    public int getTotal() {
        return total;
    }

    public void setTotal(int total) {
        this.total = total;
    }

    public List<AnalysisResponseDto> getResults() {
        return results;
    }

    public void setResults(List<AnalysisResponseDto> results) {
        this.results = results;
    }
}
