package com.smartev.repository;

import com.smartev.model.VehicleConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface VehicleConfigRepository extends JpaRepository<VehicleConfig, Long> {
    Optional<VehicleConfig> findByDeviceId(String deviceId);
}
