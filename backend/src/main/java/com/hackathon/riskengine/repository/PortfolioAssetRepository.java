package com.hackathon.riskengine.repository;

import com.hackathon.riskengine.model.AssetType;
import com.hackathon.riskengine.model.PortfolioAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PortfolioAssetRepository extends JpaRepository<PortfolioAsset, Long> {

    List<PortfolioAsset> findByAssetType(AssetType assetType);

    List<PortfolioAsset> findBySector(String sector);

    List<PortfolioAsset> findByCurrency(String currency);

    @Query("SELECT COALESCE(SUM(p.notionalValue), 0.0) FROM PortfolioAsset p")
    Double getTotalNotionalValue();

    @Query("SELECT p.assetType, COUNT(p), SUM(p.notionalValue) FROM PortfolioAsset p GROUP BY p.assetType")
    List<Object[]> getAssetClassBreakdown();

    @Query("SELECT p.sector, COUNT(p), SUM(p.notionalValue) FROM PortfolioAsset p GROUP BY p.sector")
    List<Object[]> getSectorBreakdown();

    @Query("SELECT p.currency, COUNT(p), SUM(p.notionalValue) FROM PortfolioAsset p GROUP BY p.currency")
    List<Object[]> getCurrencyBreakdown();
}
