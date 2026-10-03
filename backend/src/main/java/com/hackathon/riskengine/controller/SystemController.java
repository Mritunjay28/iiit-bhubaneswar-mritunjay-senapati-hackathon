package com.hackathon.riskengine.controller;

import com.hackathon.riskengine.dto.SystemStatusDto;
import com.hackathon.riskengine.repository.PortfolioAssetRepository;
import com.hackathon.riskengine.repository.RiskSignalRepository;
import com.hackathon.riskengine.repository.StressTestResultRepository;
import com.hackathon.riskengine.service.NlpServiceClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/system")
public class SystemController {

    private final PortfolioAssetRepository portfolioAssetRepository;
    private final RiskSignalRepository riskSignalRepository;
    private final StressTestResultRepository stressTestResultRepository;
    private final NlpServiceClient nlpServiceClient;

    @Value("${spring.profiles.active:production}")
    private String activeProfile;

    public SystemController(
            PortfolioAssetRepository portfolioAssetRepository,
            RiskSignalRepository riskSignalRepository,
            StressTestResultRepository stressTestResultRepository,
            NlpServiceClient nlpServiceClient) {
        this.portfolioAssetRepository = portfolioAssetRepository;
        this.riskSignalRepository = riskSignalRepository;
        this.stressTestResultRepository = stressTestResultRepository;
        this.nlpServiceClient = nlpServiceClient;
    }

    @GetMapping("/status")
    public ResponseEntity<SystemStatusDto> getSystemStatus() {
        SystemStatusDto status = new SystemStatusDto();
        status.setStatus("UP");
        status.setEnvironment(activeProfile);
        status.setAssetCount(portfolioAssetRepository.count());
        status.setSignalCount(riskSignalRepository.count());
        status.setStressTestCount(stressTestResultRepository.count());
        status.setTotalPortfolioNotional(portfolioAssetRepository.getTotalNotionalValue());
        status.setNlpServiceOnline(nlpServiceClient.isNlpServiceAvailable());
        status.setNlpServiceUrl(nlpServiceClient.getBaseUrl());
        status.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(status);
    }
}
