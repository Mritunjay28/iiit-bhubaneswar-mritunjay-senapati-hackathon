package com.hackathon.riskengine.repository;

import com.hackathon.riskengine.model.EventType;
import com.hackathon.riskengine.model.RiskSignal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RiskSignalRepository extends JpaRepository<RiskSignal, Long> {

    List<RiskSignal> findByEventTypeOrderByTimestampDesc(EventType eventType);

    List<RiskSignal> findBySourceOrderByTimestampDesc(String source);

    List<RiskSignal> findByStressTestTriggeredTrueOrderByTimestampDesc();

    List<RiskSignal> findByImpactScoreGreaterThanEqualOrderByTimestampDesc(Integer minImpact);

    List<RiskSignal> findTop10ByOrderByTimestampDesc();

    Page<RiskSignal> findAllByOrderByTimestampDesc(Pageable pageable);

    @Query("SELECT COALESCE(AVG(r.sentimentScore), 0.0) FROM RiskSignal r")
    Double getAverageSentimentScore();

    @Query("SELECT r.eventType, COUNT(r) FROM RiskSignal r GROUP BY r.eventType")
    List<Object[]> getEventTypeDistribution();

    @Query("SELECT r.impactScore, COUNT(r) FROM RiskSignal r GROUP BY r.impactScore ORDER BY r.impactScore ASC")
    List<Object[]> getImpactScoreDistribution();

    @Query("SELECT r.source, COUNT(r) FROM RiskSignal r GROUP BY r.source")
    List<Object[]> getSourceDistribution();

    long countByStressTestTriggeredTrue();

    long countByTimestampAfter(LocalDateTime timestamp);
}
