package com.smartev.repository;

import com.smartev.model.VehicleTrackingPoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VehicleTrackingPointRepository extends JpaRepository<VehicleTrackingPoint, Long> {
    List<VehicleTrackingPoint> findTop20ByDeviceIdOrderByRecordedAtDesc(String deviceId);
}
