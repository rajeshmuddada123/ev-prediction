package com.smartev.repository;

import com.smartev.model.ChargingStation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChargingStationRepository extends JpaRepository<ChargingStation, Long> {

    Optional<ChargingStation> findByStationCode(String stationCode);

    List<ChargingStation> findByCityIgnoreCase(String city);

    @Query("SELECT s FROM ChargingStation s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(s.address) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(s.city) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(s.operatorName) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<ChargingStation> searchStations(@Param("query") String query);
}
