package com.smartev.repository;

import com.smartev.model.ChargingConnector;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChargingConnectorRepository extends JpaRepository<ChargingConnector, Long> {
    List<ChargingConnector> findByStationId(Long stationId);
}
