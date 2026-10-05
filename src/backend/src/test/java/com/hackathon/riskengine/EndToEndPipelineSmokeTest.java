package com.hackathon.riskengine;

import com.hackathon.riskengine.model.EventType;
import com.hackathon.riskengine.repository.PortfolioAssetRepository;
import com.hackathon.riskengine.repository.RiskSignalRepository;
import com.hackathon.riskengine.repository.StressTestResultRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Phase 5 End-to-End Pipeline Smoke Test
 * Validates the complete flow:
 * Ingestion -> NLP Analysis -> Risk Signal -> Impact Threshold (>= 7) Auto-Trigger -> Stress Test Engine -> Portfolio Recalculation
 */
@SpringBootTest
@AutoConfigureMockMvc
public class EndToEndPipelineSmokeTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PortfolioAssetRepository portfolioAssetRepository;

    @Autowired
    private RiskSignalRepository riskSignalRepository;

    @Autowired
    private StressTestResultRepository stressTestResultRepository;

    @Test
    @DisplayName("End-to-End Pipeline: Ingest High-Impact News -> Auto Stress Test -> Validate Loss Calculation")
    public void testFullIngestionToStressTestPipeline() throws Exception {
        long initialSignalCount = riskSignalRepository.count();
        long initialTestCount = stressTestResultRepository.count();
        assertEquals(15, portfolioAssetRepository.count(), "Initial portfolio must contain 15 assets");

        // 1. Ingest High-Impact Geopolitical News (War & sanctions escalate)
        String highImpactPayload = """
                {
                    "text": "War conflict escalates with severe economic sanctions disrupting global maritime shipping lanes.",
                    "source": "GDELT",
                    "entity": "Global Shipping"
                }
                """;

        mockMvc.perform(post("/api/signals/ingest")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(highImpactPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.signal.eventType").value("GEOPOLITICAL"))
                .andExpect(jsonPath("$.signal.impactScore", greaterThanOrEqualTo(7)))
                .andExpect(jsonPath("$.stressTestTriggered").value(true))
                .andExpect(jsonPath("$.stressTestResult").exists())
                .andExpect(jsonPath("$.stressTestResult.portfolioValueBefore").value(585.0))
                .andExpect(jsonPath("$.stressTestResult.totalPnlImpact", lessThan(0.0)))
                .andExpect(jsonPath("$.stressTestResult.assetDetails", hasSize(15)));

        // Verify repository state incremented
        assertEquals(initialSignalCount + 1, riskSignalRepository.count());
        assertEquals(initialTestCount + 1, stressTestResultRepository.count());

        // 2. Ingest Low-Impact Routine News -> Must NOT trigger stress test
        String lowImpactPayload = """
                {
                    "text": "Tech company showcases quarterly developer conference with routine software improvements.",
                    "source": "TWITTER",
                    "entity": "TechCo"
                }
                """;

        mockMvc.perform(post("/api/signals/ingest")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(lowImpactPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.signal.impactScore", lessThan(7)))
                .andExpect(jsonPath("$.stressTestTriggered").value(false));

        // Stress test count must remain unchanged
        assertEquals(initialTestCount + 1, stressTestResultRepository.count());

        // 3. Verify Stress Test Audit History endpoint reflects the execution
        mockMvc.perform(get("/api/stress-tests?page=0&size=5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", not(empty())))
                .andExpect(jsonPath("$.totalElements", greaterThanOrEqualTo((int) (initialTestCount + 1))));

        // 4. Verify Portfolio Summary Aggregations
        mockMvc.perform(get("/api/portfolio/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalNotionalValue").value(585.0))
                .andExpect(jsonPath("$.totalAssetCount").value(15));
    }
}
