package com.hackathon.riskengine.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Root API Controller providing platform discovery, endpoint catalogs, and telemetry links.
 * Responds to both GET / and GET /api so that developers and evaluators navigating to
 * the advertised backend API endpoint receive a structured, helpful index.
 */
@RestController
public class ApiRootController {

    @GetMapping({"/", "/api"})
    public ResponseEntity<Map<String, Object>> getApiRoot() {
        Map<String, Object> root = new LinkedHashMap<>();
        root.put("name", "AI/NLP Financial Risk Engine & Strategic Stress-Testing Platform");
        root.put("status", "UP");
        root.put("version", "1.0.0");
        root.put("description", "Unified platform marrying real-time NLP sentiment analysis with institutional portfolio stress-testing");
        root.put("timestamp", LocalDateTime.now());

        Map<String, String> endpoints = new LinkedHashMap<>();
        endpoints.put("apiRoot", "/api");
        endpoints.put("systemStatus", "/api/system/status");
        endpoints.put("portfolio", "/api/portfolio");
        endpoints.put("portfolioSummary", "/api/portfolio/summary");
        endpoints.put("riskSignals", "/api/signals");
        endpoints.put("riskSignalsLatest", "/api/signals/latest");
        endpoints.put("riskSignalsStats", "/api/signals/stats");
        endpoints.put("stressTests", "/api/stress-tests");
        endpoints.put("stressTestsLatest", "/api/stress-tests/latest");
        endpoints.put("stressTestScenarios", "/api/stress-tests/scenarios");
        endpoints.put("actuatorHealth", "/actuator/health");
        endpoints.put("actuatorInfo", "/actuator/info");
        root.put("endpoints", endpoints);

        Map<String, String> external = new LinkedHashMap<>();
        external.put("frontendDashboard", "http://localhost:5173");
        external.put("nlpDocs", "http://localhost:8000/docs");
        root.put("links", external);

        return ResponseEntity.ok(root);
    }
}
