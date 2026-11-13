package com.smartev.repository;

import com.smartev.model.SecurityEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SecurityEventRepository extends JpaRepository<SecurityEvent, Long> {
    List<SecurityEvent> findTop50ByOrderByCreatedAtDesc();
    long countByIsBlockedTrue();
    long countByRiskLevel(String riskLevel);
}
