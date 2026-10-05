package com.hackathon.riskengine.dto;

public class SignalIngestRequestDto {

    private String text;
    private String source = "CUSTOM";
    private String entity;

    public SignalIngestRequestDto() {
    }

    public SignalIngestRequestDto(String text, String source, String entity) {
        this.text = text;
        this.source = source != null ? source : "CUSTOM";
        this.entity = entity;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getEntity() {
        return entity;
    }

    public void setEntity(String entity) {
        this.entity = entity;
    }
}
