package com.smartev.controller;

import com.smartev.dto.TrackingUpdateRequest;
import com.smartev.model.VehicleTrackingPoint;
import com.smartev.service.TrackingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/tracking")
@CrossOrigin(origins = "*")
public class TrackingController {

    private final TrackingService trackingService;

    public TrackingController(TrackingService trackingService) {
        this.trackingService = trackingService;
    }

    @PostMapping("/update")
    public ResponseEntity<VehicleTrackingPoint> updateLocation(@RequestBody TrackingUpdateRequest req) {
        return ResponseEntity.ok(trackingService.updateLocation(req));
    }

    @GetMapping("/latest")
    public ResponseEntity<?> getLatestLocation(@RequestParam String deviceId) {
        return trackingService.getLatestLocation(deviceId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/stop")
    public ResponseEntity<?> stopTracking(@RequestBody Map<String, String> body) {
        String deviceId = body.get("deviceId");
        if (deviceId != null) {
            trackingService.stopTracking(deviceId);
        }
        return ResponseEntity.ok(Map.of("status", "STOPPED"));
    }
}
