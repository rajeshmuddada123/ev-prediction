package com.smartev.controller;

import com.smartev.dto.BookingRequest;
import com.smartev.model.Booking;
import com.smartev.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<?> createBooking(@Valid @RequestBody BookingRequest req) {
        try {
            Booking booking = bookingService.createBooking(req);
            return ResponseEntity.status(HttpStatus.CREATED).body(booking);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Booking>> getUserBookings(@RequestParam String deviceId) {
        return ResponseEntity.ok(bookingService.getUserBookings(deviceId));
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<?> getBooking(@PathVariable String bookingId) {
        return bookingService.getBookingById(bookingId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{bookingId}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable String bookingId, @RequestBody Map<String, String> body) {
        String deviceId = body.get("deviceId");
        if (deviceId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "deviceId is required"));
        }
        try {
            Booking cancelled = bookingService.cancelBooking(bookingId, deviceId);
            return ResponseEntity.ok(cancelled);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{bookingId}/reschedule")
    public ResponseEntity<?> rescheduleBooking(@PathVariable String bookingId, @RequestBody Map<String, Object> body) {
        String deviceId = (String) body.get("deviceId");
        String dateStr = (String) body.get("newDate");
        String newTime = (String) body.get("newTime");

        if (deviceId == null || dateStr == null || newTime == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "deviceId, newDate, and newTime are required"));
        }

        try {
            LocalDate newDate = LocalDate.parse(dateStr);
            Booking updated = bookingService.rescheduleBooking(bookingId, deviceId, newDate, newTime);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
