package com.smartev.service;

import com.smartev.dto.BookingRequest;
import com.smartev.model.Booking;
import com.smartev.model.ChargingSlot;
import com.smartev.model.ChargingStation;
import com.smartev.repository.BookingRepository;
import com.smartev.repository.ChargingSlotRepository;
import com.smartev.repository.ChargingStationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ChargingStationRepository stationRepository;
    private final ChargingSlotRepository slotRepository;
    private final NotificationService notificationService;

    public BookingService(BookingRepository bookingRepository,
                          ChargingStationRepository stationRepository,
                          ChargingSlotRepository slotRepository,
                          NotificationService notificationService) {
        this.bookingRepository = bookingRepository;
        this.stationRepository = stationRepository;
        this.slotRepository = slotRepository;
        this.notificationService = notificationService;
    }

    /**
     * Create booking with transaction isolation to prevent concurrent double-booking conflicts.
     */
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public Booking createBooking(BookingRequest req) {
        ChargingStation station = stationRepository.findById(req.getStationId())
                .orElseThrow(() -> new IllegalArgumentException("Station not found with ID: " + req.getStationId()));

        LocalDate date = req.getSlotDate() != null ? req.getSlotDate() : LocalDate.now();

        // Find or initialize slot
        ChargingSlot slot = slotRepository.findByStationIdAndSlotDateAndSlotTime(station.getId(), date, req.getSlotTime())
                .orElseGet(() -> {
                    ChargingSlot newSlot = new ChargingSlot(station, date, req.getSlotTime(), station.getTotalChargers());
                    return slotRepository.save(newSlot);
                });

        if (!slot.isAvailable()) {
            throw new IllegalStateException("Selected time slot is already fully booked! Please choose another slot.");
        }

        // Increment atomic booking counter
        slot.incrementBooking();
        slotRepository.save(slot);

        // Estimate energy & cost
        double connectorPower = 50.0;
        if (req.getConnectorType() != null && req.getConnectorType().contains("Type 2")) {
            connectorPower = 22.0;
        } else if (station.getMaxPowerKw() != null) {
            connectorPower = station.getMaxPowerKw();
        }

        double durationHours = req.getDurationMinutes() != null ? (req.getDurationMinutes() / 60.0) : 1.0;
        double estimatedEnergy = Math.round(connectorPower * durationHours * 0.85 * 10.0) / 10.0; // 85% avg charging rate
        double estimatedCost = Math.round(estimatedEnergy * (station.getCostPerKwh() != null ? station.getCostPerKwh() : 18.0) * 10.0) / 10.0;

        String bookingId = "SEV-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Booking booking = new Booking(
                bookingId,
                req.getDeviceId(),
                station,
                station.getName(),
                date,
                req.getSlotTime(),
                req.getDurationMinutes() != null ? req.getDurationMinutes() : 60,
                req.getConnectorType(),
                req.getVehicleModel() != null ? req.getVehicleModel() : "Electric Vehicle",
                estimatedEnergy,
                estimatedCost
        );

        Booking saved = bookingRepository.save(booking);

        // Notify user
        notificationService.createNotification(
                req.getDeviceId(),
                "Charging Slot Confirmed: " + bookingId,
                "Your slot at " + station.getName() + " on " + date + " (" + req.getSlotTime() + ") has been reserved successfully.",
                "BOOKING",
                "SUCCESS"
        );

        return saved;
    }

    @Transactional
    public Booking cancelBooking(String bookingId, String deviceId) {
        Booking booking = bookingRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + bookingId));

        if (!booking.getDeviceId().equals(deviceId)) {
            throw new SecurityException("Unauthorized to cancel this booking.");
        }

        if ("CANCELLED".equals(booking.getStatus())) {
            throw new IllegalStateException("Booking is already cancelled.");
        }

        booking.setStatus("CANCELLED");
        Booking saved = bookingRepository.save(booking);

        // Release slot capacity
        slotRepository.findByStationIdAndSlotDateAndSlotTime(
                booking.getStation().getId(), booking.getSlotDate(), booking.getSlotTime()
        ).ifPresent(slot -> {
            slot.decrementBooking();
            slotRepository.save(slot);
        });

        notificationService.createNotification(
                deviceId,
                "Booking Cancelled: " + bookingId,
                "Your booking at " + booking.getStationName() + " has been cancelled. Any slot hold was released.",
                "BOOKING",
                "WARNING"
        );

        return saved;
    }

    @Transactional
    public Booking rescheduleBooking(String bookingId, String deviceId, LocalDate newDate, String newTime) {
        Booking booking = bookingRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + bookingId));

        if (!booking.getDeviceId().equals(deviceId)) {
            throw new SecurityException("Unauthorized to reschedule this booking.");
        }

        // Release old slot
        slotRepository.findByStationIdAndSlotDateAndSlotTime(
                booking.getStation().getId(), booking.getSlotDate(), booking.getSlotTime()
        ).ifPresent(slot -> {
            slot.decrementBooking();
            slotRepository.save(slot);
        });

        // Reserve new slot
        ChargingSlot newSlot = slotRepository.findByStationIdAndSlotDateAndSlotTime(
                booking.getStation().getId(), newDate, newTime
        ).orElseGet(() -> {
            ChargingSlot s = new ChargingSlot(booking.getStation(), newDate, newTime, booking.getStation().getTotalChargers());
            return slotRepository.save(s);
        });

        if (!newSlot.isAvailable()) {
            throw new IllegalStateException("New slot " + newTime + " on " + newDate + " is fully booked.");
        }

        newSlot.incrementBooking();
        slotRepository.save(newSlot);

        booking.setSlotDate(newDate);
        booking.setSlotTime(newTime);
        booking.setStatus("RESCHEDULED");
        Booking saved = bookingRepository.save(booking);

        notificationService.createNotification(
                deviceId,
                "Booking Rescheduled: " + bookingId,
                "Your slot has been shifted to " + newDate + " (" + newTime + ") at " + booking.getStationName(),
                "BOOKING",
                "INFO"
        );

        return saved;
    }

    public List<Booking> getUserBookings(String deviceId) {
        return bookingRepository.findByDeviceIdOrderByCreatedAtDesc(deviceId);
    }

    public Optional<Booking> getBookingById(String bookingId) {
        return bookingRepository.findByBookingId(bookingId);
    }
}
