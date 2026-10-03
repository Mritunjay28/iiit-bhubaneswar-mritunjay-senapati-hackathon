package com.hackathon.riskengine;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hackathon.riskengine.dto.ShockScenarioDto;
import com.hackathon.riskengine.dto.StressTestRequestDto;
import com.hackathon.riskengine.dto.StressTestSummaryResponseDto;
import com.hackathon.riskengine.model.AssetType;
import com.hackathon.riskengine.model.EventType;
import com.hackathon.riskengine.model.PortfolioAsset;
import com.hackathon.riskengine.repository.PortfolioAssetRepository;
import com.hackathon.riskengine.repository.StressTestResultRepository;
import com.hackathon.riskengine.service.StressTestEngineService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class StressTestEngineServiceTest {

    @Autowired
    private StressTestEngineService stressTestEngineService;

    @Autowired
    private PortfolioAssetRepository portfolioAssetRepository;

    @Autowired
    private StressTestResultRepository stressTestResultRepository;

    @BeforeEach
    public void setup() {
        assertFalse(portfolioAssetRepository.findAll().isEmpty(), "Portfolio should have been seeded by DataSeeder");
    }

    @Test
    @DisplayName("Verify Bond Shock Formula with Duration and Convexity")
    public void testBondShockFormula() {
        PortfolioAsset bond = new PortfolioAsset("US Treasury 10Y", AssetType.BOND, 100.0, 3.8, 8.2, "Government", "USD");

        // Shock parameters: Rate = +200 bps (+0.02), Spread = +100 bps (0.01)
        double shock = stressTestEngineService.calculateAssetShock(bond, -0.08, 0.02, 100.0, 0.0, 0.0);

        // Delta P = -D * delta_r - D * delta_s + 0.5 * C * (delta_r)^2
        // -8.2 * 0.02 = -0.164
        // -8.2 * 0.01 = -0.082
        // 0.5 * (8.2^2 / 2) * 0.0004 = 0.5 * 33.62 * 0.0004 = 0.006724
        // Total expected ~ -0.239 (-23.9%)
        assertTrue(shock < -0.20 && shock > -0.26, "Bond shock should be approximately -23.9%, got: " + shock);
    }

    @Test
    @DisplayName("Verify Loan Spread Widening Impact")
    public void testLoanSpreadWidening() {
        PortfolioAsset loan = new PortfolioAsset("Term Loan", AssetType.LOAN, 50.0, 5.2, null, "Banking", "USD");

        // 250 bps spread widening
        double shock = stressTestEngineService.calculateAssetShock(loan, -0.15, 0.01, 250.0, 0.0, 0.0);

        // Loan should suffer noticeable credit impairment
        assertTrue(shock < -0.10, "Loan shock under 250 bps credit spread widening should exceed -10%, got: " + shock);
    }

    @Test
    @DisplayName("Verify Equity Cyclical Sector Beta Adjustment")
    public void testEquityBetaAdjustment() {
        PortfolioAsset techEquity = new PortfolioAsset("NVIDIA Equity", AssetType.EQUITY, 15.0, null, null, "Technology", "USD");
        PortfolioAsset defEquity = new PortfolioAsset("Utility", AssetType.EQUITY, 10.0, null, null, "Government", "USD");

        double techShock = stressTestEngineService.calculateAssetShock(techEquity, -0.10, 0.0, 0.0, 0.0, 0.0);
        double defShock = stressTestEngineService.calculateAssetShock(defEquity, -0.10, 0.0, 0.0, 0.0, 0.0);

        // Tech beta (1.30) should produce deeper drawdown than Government utility beta (0.50)
        assertTrue(techShock < defShock, "Tech equity drawdown should be sharper than defensive utility");
        assertEquals(-0.13, techShock, 0.001);
        assertEquals(-0.05, defShock, 0.001);
    }

    @Test
    @DisplayName("Verify Full Portfolio Stress Test Execution")
    public void testExecuteFullStressTest() {
        StressTestRequestDto request = new StressTestRequestDto();
        request.setEventType(EventType.GEOPOLITICAL);
        request.setScenarioName("Geopolitical Unit Test Scenario");

        StressTestSummaryResponseDto summary = stressTestEngineService.executeStressTest(request);

        assertNotNull(summary);
        assertNotNull(summary.getId());
        assertEquals(EventType.GEOPOLITICAL, summary.getEventType());
        assertEquals("Geopolitical Unit Test Scenario", summary.getScenarioName());

        // Check values
        assertTrue(summary.getPortfolioValueBefore() > 500.0, "Portfolio before value should be ~$520M");
        assertTrue(summary.getPortfolioValueAfter() < summary.getPortfolioValueBefore(), "Stressed value should drop");
        assertTrue(summary.getTotalPnlImpact() < 0.0, "Total PnL should be negative");
        assertTrue(summary.getPercentageChange() < 0.0, "Percentage change should be negative");

        // Verify Asset Details count matches 15
        assertEquals(15, summary.getAssetDetails().size());

        // Verify risk metrics
        assertTrue(summary.getValueAtRisk95() > 0.0, "VaR 95% should be positive dollar exposure");
        assertTrue(summary.getValueAtRisk99() > summary.getValueAtRisk95(), "VaR 99% must exceed VaR 95%");
        assertNotNull(summary.getWorstHitAsset());
        assertTrue(summary.getWorstHitAssetPnl() < 0.0);
    }
}
