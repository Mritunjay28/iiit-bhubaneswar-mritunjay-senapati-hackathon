package com.hackathon.riskengine.repository;

import com.hackathon.riskengine.model.StressTestAssetDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StressTestAssetDetailRepository extends JpaRepository<StressTestAssetDetail, Long> {

    List<StressTestAssetDetail> findByStressTestResultId(Long stressTestResultId);

    List<StressTestAssetDetail> findByAssetId(Long assetId);
}
