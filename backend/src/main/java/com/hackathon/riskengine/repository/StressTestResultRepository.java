package com.hackathon.riskengine.repository;

import com.hackathon.riskengine.model.EventType;
import com.hackathon.riskengine.model.StressTestResult;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StressTestResultRepository extends JpaRepository<StressTestResult, Long> {

    List<StressTestResult> findByEventTypeOrderByExecutedAtDesc(EventType eventType);

    Optional<StressTestResult> findTop1ByOrderByExecutedAtDesc();

    Page<StressTestResult> findAllByOrderByExecutedAtDesc(Pageable pageable);

    List<StressTestResult> findByTriggerSignalId(Long triggerSignalId);

    List<StressTestResult> findTop5ByOrderByExecutedAtDesc();
}
