package com.hackathon.riskengine.controller;

import com.hackathon.riskengine.dto.ShockScenarioDto;
import com.hackathon.riskengine.dto.StressTestRequestDto;
import com.hackathon.riskengine.dto.StressTestSummaryResponseDto;
import com.hackathon.riskengine.model.EventType;
import com.hackathon.riskengine.model.StressTestResult;
import com.hackathon.riskengine.repository.StressTestResultRepository;
import com.hackathon.riskengine.service.StressTestEngineService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stress-tests")
public class StressTestController {

    private final StressTestEngineService stressTestEngineService;
    private final StressTestResultRepository stressTestResultRepository;

    public StressTestController(
            StressTestEngineService stressTestEngineService,
            StressTestResultRepository stressTestResultRepository) {
        this.stressTestEngineService = stressTestEngineService;
        this.stressTestResultRepository = stressTestResultRepository;
    }

    @GetMapping
    public ResponseEntity<Page<StressTestResult>> getHistoricalStressTests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(stressTestResultRepository.findAllByOrderByExecutedAtDesc(PageRequest.of(page, size)));
    }

    @GetMapping("/latest")
    public ResponseEntity<StressTestSummaryResponseDto> getLatestStressTest() {
        return stressTestResultRepository.findTop1ByOrderByExecutedAtDesc()
                .map(result -> ResponseEntity.ok(stressTestEngineService.mapToDto(result, null, null, null, null, null, null)))
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StressTestSummaryResponseDto> getStressTestById(@PathVariable Long id) {
        return stressTestResultRepository.findById(id)
                .map(result -> ResponseEntity.ok(stressTestEngineService.mapToDto(result, null, null, null, null, null, null)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/scenarios")
    public ResponseEntity<List<ShockScenarioDto>> getAvailableScenarios() {
        return ResponseEntity.ok(stressTestEngineService.getAllScenarios());
    }

    @GetMapping("/scenarios/{eventType}")
    public ResponseEntity<ShockScenarioDto> getScenarioByEventType(@PathVariable EventType eventType) {
        return ResponseEntity.ok(stressTestEngineService.getScenario(eventType));
    }

    @PostMapping("/run")
    public ResponseEntity<StressTestSummaryResponseDto> runStressTest(@RequestBody StressTestRequestDto request) {
        StressTestSummaryResponseDto result = stressTestEngineService.executeStressTest(request);
        return ResponseEntity.ok(result);
    }
}
