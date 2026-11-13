package com.smartev.repository;

import com.smartev.model.SolarSystemConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SolarSystemConfigRepository extends JpaRepository<SolarSystemConfig, Long> {
    Optional<SolarSystemConfig> findByDeviceId(String deviceId);
}
