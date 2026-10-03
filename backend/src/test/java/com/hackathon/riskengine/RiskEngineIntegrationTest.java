package com.hackathon.riskengine;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class RiskEngineIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("GET /api/system/status returns 200 with cluster metrics")
    public void testGetSystemStatus() throws Exception {
        mockMvc.perform(get("/api/system/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.assetCount").value(15))
                .andExpect(jsonPath("$.totalPortfolioNotional").value(585.0));
    }

    @Test
    @DisplayName("GET /api/portfolio/summary returns 200 with asset allocation")
    public void testGetPortfolioSummary() throws Exception {
        mockMvc.perform(get("/api/portfolio/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalNotionalValue").value(585.0))
                .andExpect(jsonPath("$.totalAssetCount").value(15))
                .andExpect(jsonPath("$.assetClassBreakdown", hasSize(4)));
    }

    @Test
    @DisplayName("GET /api/portfolio returns all 15 assets")
    public void testGetAllPortfolioAssets() throws Exception {
        mockMvc.perform(get("/api/portfolio"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(15)))
                .andExpect(jsonPath("$[0].assetName", notNullValue()));
    }

    @Test
    @DisplayName("GET /api/stress-tests/scenarios returns all 7 standard shock scenarios")
    public void testGetStressScenarios() throws Exception {
        mockMvc.perform(get("/api/stress-tests/scenarios"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(7))))
                .andExpect(jsonPath("$[?(@.eventType == 'GEOPOLITICAL')].equityShock").value(-0.12));
    }

    @Test
    @DisplayName("POST /api/stress-tests/run executes stress test on demand")
    public void testRunManualStressTest() throws Exception {
        String payload = """
                {
                    "scenarioName": "Custom Rate Hike Shock",
                    "eventType": "MACROECONOMIC",
                    "equityShock": -0.10,
                    "interestRateShock": 0.025,
                    "creditSpreadShockBps": 120.0,
                    "fxShock": -0.04,
                    "commodityShock": -0.06
                }
                """;

        mockMvc.perform(post("/api/stress-tests/run")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.scenarioName").value("Custom Rate Hike Shock"))
                .andExpect(jsonPath("$.eventType").value("MACROECONOMIC"))
                .andExpect(jsonPath("$.percentageChange").value(lessThan(0.0)))
                .andExpect(jsonPath("$.assetDetails", hasSize(15)))
                .andExpect(jsonPath("$.worstHitAsset", notNullValue()));
    }

    @Test
    @DisplayName("POST /api/signals/ingest processes text and triggers stress test if impact >= 7")
    public void testIngestSignalEndpoint() throws Exception {
        String payload = """
                {
                    "text": "Severe sovereign debt default crisis hits major commercial real estate group with massive bond rating downgrades.",
                    "source": "NEWS",
                    "entity": "Global Group"
                }
                """;

        mockMvc.perform(post("/api/signals/ingest")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.signal.eventType").value("CREDIT_EVENT"))
                .andExpect(jsonPath("$.signal.impactScore").value(greaterThanOrEqualTo(7)))
                .andExpect(jsonPath("$.stressTestTriggered").value(true))
                .andExpect(jsonPath("$.stressTestResult").exists());
    }

    @Test
    @DisplayName("GET /api/signals/stats returns aggregated risk signal statistics")
    public void testGetSignalStats() throws Exception {
        mockMvc.perform(get("/api/signals/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalSignals", greaterThan(0)))
                .andExpect(jsonPath("$.eventTypeDistribution").isMap());
    }
}
