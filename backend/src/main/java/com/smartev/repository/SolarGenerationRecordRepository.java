package com.smartev.repository;

import com.smartev.model.SolarGenerationRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SolarGenerationRecordRepository extends JpaRepository<SolarGenerationRecord, Long> {
    List<SolarGenerationRecord> findTop14ByDeviceIdOrderByRecordedDateDesc(String deviceId);
}
