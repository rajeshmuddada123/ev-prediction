package com.smartev.repository;

import com.smartev.model.ChargingSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChargingSlotRepository extends JpaRepository<ChargingSlot, Long> {
    List<ChargingSlot> findByStationIdAndSlotDate(Long stationId, LocalDate slotDate);
    Optional<ChargingSlot> findByStationIdAndSlotDateAndSlotTime(Long stationId, LocalDate slotDate, String slotTime);
}
