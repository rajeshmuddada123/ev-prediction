package com.smartev.repository;

import com.smartev.model.ChargingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChargingSessionRepository extends JpaRepository<ChargingSession, Long> {
    Optional<ChargingSession> findBySessionId(String sessionId);
    List<ChargingSession> findByDeviceIdOrderByStartedAtDesc(String deviceId);
    Optional<ChargingSession> findFirstByDeviceIdAndStatus(String deviceId, String status);
}
