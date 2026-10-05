package com.hackathon.riskengine;

import com.hackathon.riskengine.dto.SignalIngestResponseDto;
import com.hackathon.riskengine.dto.SignalStatsDto;
import com.hackathon.riskengine.model.EventType;
import com.hackathon.riskengine.service.RiskOrchestrationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class RiskOrchestrationServiceTest {

    @Autowired
    private RiskOrchestrationService orchestrationService;

    @Test
    @DisplayName("Verify Auto-Trigger Stress Test on High-Impact Geopolitical Crisis News")
    public void testHighImpactAutoTrigger() {
        String headline = "Military escalation and cross-border missile strikes prompt emergency sanctions and oil import embargo.";

        SignalIngestResponseDto response = orchestrationService.ingestAndEvaluate(headline, "GDELT", "NATO");

        assertNotNull(response);
        assertNotNull(response.getSignal());
        assertEquals("GDELT", response.getSignal().getSource());
        assertEquals(EventType.GEOPOLITICAL, response.getSignal().getEventType());
        assertTrue(response.getSignal().getImpactScore() >= 7, "Impact score should be >= 7 for severe military crisis");

        // Verify stress test was automatically triggered
        assertTrue(response.isStressTestTriggered());
        assertTrue(response.getSignal().getStressTestTriggered());
        assertNotNull(response.getStressTestResult(), "Stress test result must be attached to high-impact ingest response");
        assertEquals(EventType.GEOPOLITICAL, response.getStressTestResult().getEventType());
        assertTrue(response.getStressTestResult().getTotalPnlImpact() < 0.0);
    }

    @Test
    @DisplayName("Verify Low-Impact News Does Not Auto-Trigger Stress Test")
    public void testLowImpactNoAutoTrigger() {
        String headline = "Tech startup launches lightweight smartphone app update with minor bug fixes.";

        SignalIngestResponseDto response = orchestrationService.ingestAndEvaluate(headline, "CUSTOM", "TechStart");

        assertNotNull(response);
        assertNotNull(response.getSignal());
        assertTrue(response.getSignal().getImpactScore() < 7, "Mild product update should score below 7");
        assertFalse(response.isStressTestTriggered(), "Should NOT trigger stress test for mild update");
        assertFalse(response.getSignal().getStressTestTriggered());
        assertNull(response.getStressTestResult());
    }

    @Test
    @DisplayName("Verify Signal Stats Aggregation")
    public void testSignalStats() {
        SignalStatsDto stats = orchestrationService.getSignalStats();
        assertNotNull(stats);
        assertTrue(stats.getTotalSignals() > 0, "Should have signals recorded");
        assertNotNull(stats.getAverageSentiment());
        assertNotNull(stats.getEventTypeDistribution());
    }
}
