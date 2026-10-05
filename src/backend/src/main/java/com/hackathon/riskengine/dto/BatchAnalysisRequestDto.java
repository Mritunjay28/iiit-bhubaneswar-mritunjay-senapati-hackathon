package com.hackathon.riskengine.dto;

import java.util.ArrayList;
import java.util.List;

public class BatchAnalysisRequestDto {

    private List<String> texts = new ArrayList<>();
    private String source = "CUSTOM";

    public BatchAnalysisRequestDto() {
    }

    public BatchAnalysisRequestDto(List<String> texts, String source) {
        this.texts = texts != null ? texts : new ArrayList<>();
        this.source = source != null ? source : "CUSTOM";
    }

    public List<String> getTexts() {
        return texts;
    }

    public void setTexts(List<String> texts) {
        this.texts = texts;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }
}
