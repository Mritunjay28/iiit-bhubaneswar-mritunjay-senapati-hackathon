package com.hackathon.riskengine.controller;

import com.hackathon.riskengine.dto.*;
import com.hackathon.riskengine.model.EventType;
import com.hackathon.riskengine.model.RiskSignal;
import com.hackathon.riskengine.service.RiskOrchestrationService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/signals")
public class RiskSignalController {

    private final RiskOrchestrationService orchestrationService;

    public RiskSignalController(RiskOrchestrationService orchestrationService) {
        this.orchestrationService = orchestrationService;
    }

    @GetMapping
    public ResponseEntity<Page<RiskSignal>> getSignals(
            @RequestParam(required = false) EventType eventType,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) Integer minImpact,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(orchestrationService.getSignals(eventType, source, minImpact, page, size));
    }

    @GetMapping("/latest")
    public ResponseEntity<List<RiskSignal>> getLatestSignals() {
        return ResponseEntity.ok(orchestrationService.getLatestSignals());
    }

    @GetMapping("/stats")
    public ResponseEntity<SignalStatsDto> getSignalStats() {
        return ResponseEntity.ok(orchestrationService.getSignalStats());
    }

    @PostMapping("/ingest")
    public ResponseEntity<SignalIngestResponseDto> ingestSignal(@RequestBody SignalIngestRequestDto request) {
        SignalIngestResponseDto response = orchestrationService.ingestAndEvaluate(
                request.getText(),
                request.getSource(),
                request.getEntity()
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/ingest/batch")
    public ResponseEntity<List<SignalIngestResponseDto>> ingestBatch(@RequestBody BatchAnalysisRequestDto request) {
        List<SignalIngestResponseDto> responses = orchestrationService.ingestBatch(
                request.getTexts(),
                request.getSource()
        );
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/fetch/gdelt")
    public ResponseEntity<List<SignalIngestResponseDto>> fetchAndIngestGdelt(
            @RequestParam(defaultValue = "bank crisis OR interest rate OR default") String query,
            @RequestParam(defaultValue = "1") Integer days,
            @RequestParam(defaultValue = "10") Integer maxRecords) {
        List<SignalIngestResponseDto> responses = orchestrationService.ingestGdeltNews(query, days, maxRecords);
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/fetch/tweets")
    public ResponseEntity<List<SignalIngestResponseDto>> fetchAndIngestTweets(
            @RequestParam(required = false) String filePath,
            @RequestParam(defaultValue = "50") Integer limit) {
        List<SignalIngestResponseDto> responses = orchestrationService.ingestTweets(filePath, limit);
        return ResponseEntity.ok(responses);
    }
}
