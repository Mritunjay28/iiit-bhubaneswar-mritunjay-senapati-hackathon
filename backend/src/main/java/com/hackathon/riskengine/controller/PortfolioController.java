package com.hackathon.riskengine.controller;

import com.hackathon.riskengine.dto.PortfolioSummaryDto;
import com.hackathon.riskengine.model.AssetType;
import com.hackathon.riskengine.model.PortfolioAsset;
import com.hackathon.riskengine.service.PortfolioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portfolio")
public class PortfolioController {

    private final PortfolioService portfolioService;

    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @GetMapping
    public ResponseEntity<List<PortfolioAsset>> getAllAssets(
            @RequestParam(required = false) AssetType assetType,
            @RequestParam(required = false) String sector) {
        if (assetType != null) {
            return ResponseEntity.ok(portfolioService.getAssetsByType(assetType));
        }
        if (sector != null && !sector.isBlank()) {
            return ResponseEntity.ok(portfolioService.getAssetsBySector(sector));
        }
        return ResponseEntity.ok(portfolioService.getAllAssets());
    }

    @GetMapping("/summary")
    public ResponseEntity<PortfolioSummaryDto> getPortfolioSummary() {
        return ResponseEntity.ok(portfolioService.getPortfolioSummary());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PortfolioAsset> getAssetById(@PathVariable Long id) {
        return portfolioService.getAssetById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PortfolioAsset> createAsset(@RequestBody PortfolioAsset asset) {
        return ResponseEntity.ok(portfolioService.saveAsset(asset));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAsset(@PathVariable Long id) {
        portfolioService.deleteAsset(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/reset")
    public ResponseEntity<List<PortfolioAsset>> resetPortfolio() {
        return ResponseEntity.ok(portfolioService.resetToDefaultSynthetic());
    }
}
