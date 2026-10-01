package com.hackathon.riskengine.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "risk_signals")
public class RiskSignal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String source; // GDELT, TWITTER, CUSTOM

    @Column(columnDefinition = "TEXT", nullable = false)
    private String rawText;

    @Column(length = 100)
    private String entity;

    @Column(nullable = false)
    private Double sentimentScore; // -1.0 to 1.0

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private EventType eventType;

    @Column(nullable = false)
    private Integer impactScore; // 1 to 10

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private Boolean stressTestTriggered = false;

    public RiskSignal() {
    }

    public RiskSignal(String source, String rawText, String entity, Double sentimentScore,
                      EventType eventType, Integer impactScore, LocalDateTime timestamp,
                      Boolean stressTestTriggered) {
        this.source = source;
        this.rawText = rawText;
        this.entity = entity;
        this.sentimentScore = sentimentScore;
        this.eventType = eventType;
        this.impactScore = impactScore;
        this.timestamp = timestamp != null ? timestamp : LocalDateTime.now();
        this.stressTestTriggered = stressTestTriggered != null ? stressTestTriggered : false;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getRawText() {
        return rawText;
    }

    public void setRawText(String rawText) {
        this.rawText = rawText;
    }

    public String getEntity() {
        return entity;
    }

    public void setEntity(String entity) {
        this.entity = entity;
    }

    public Double getSentimentScore() {
        return sentimentScore;
    }

    public void setSentimentScore(Double sentimentScore) {
        this.sentimentScore = sentimentScore;
    }

    public EventType getEventType() {
        return eventType;
    }

    public void setEventType(EventType eventType) {
        this.eventType = eventType;
    }

    public Integer getImpactScore() {
        return impactScore;
    }

    public void setImpactScore(Integer impactScore) {
        this.impactScore = impactScore;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public Boolean getStressTestTriggered() {
        return stressTestTriggered;
    }

    public void setStressTestTriggered(Boolean stressTestTriggered) {
        this.stressTestTriggered = stressTestTriggered;
    }

    @PrePersist
    protected void onCreate() {
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
        if (this.stressTestTriggered == null) {
            this.stressTestTriggered = false;
        }
    }
}
