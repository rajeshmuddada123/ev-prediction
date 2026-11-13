package com.smartev.repository;

import com.smartev.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByBookingId(String bookingId);
    List<Booking> findByDeviceIdOrderByCreatedAtDesc(String deviceId);
    List<Booking> findByStationIdAndStatus(Long stationId, String status);
}
