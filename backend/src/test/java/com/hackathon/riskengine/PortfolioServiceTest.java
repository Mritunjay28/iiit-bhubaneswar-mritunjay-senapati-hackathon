package com.hackathon.riskengine;

import com.hackathon.riskengine.dto.PortfolioSummaryDto;
import com.hackathon.riskengine.model.AssetType;
import com.hackathon.riskengine.model.PortfolioAsset;
import com.hackathon.riskengine.service.PortfolioService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class PortfolioServiceTest {

    @Autowired
    private PortfolioService portfolioService;

    @Test
    @DisplayName("Verify Synthetic Portfolio Assets Count and Notional")
    public void testPortfolioAssets() {
        List<PortfolioAsset> assets = portfolioService.getAllAssets();
        assertEquals(15, assets.size(), "Should contain exactly 15 synthetic assets");

        PortfolioSummaryDto summary = portfolioService.getPortfolioSummary();
        assertNotNull(summary);
        assertEquals(15, summary.getTotalAssetCount());
        assertEquals(585.0, summary.getTotalNotionalValue(), 0.01, "Total notional should be $585M");

        // Verify all 4 asset classes are present
        assertEquals(4, summary.getAssetClassBreakdown().size());

        // Verify currency breakdown contains USD, EUR, GBP, INR
        assertTrue(summary.getCurrencyAllocation().containsKey("USD"));
        assertTrue(summary.getCurrencyAllocation().containsKey("EUR"));
        assertTrue(summary.getCurrencyAllocation().containsKey("GBP"));
        assertTrue(summary.getCurrencyAllocation().containsKey("INR"));

        // Verify duration and coupon
        assertTrue(summary.getPortfolioWeightedDuration() > 4.0, "Average bond duration should be > 4 years");
        assertTrue(summary.getAverageCouponRate() > 3.0, "Average coupon should be > 3%");
    }
}
