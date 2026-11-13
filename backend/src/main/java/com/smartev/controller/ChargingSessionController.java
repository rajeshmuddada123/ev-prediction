package com.smartev.controller;

import com.smartev.model.ChargingSession;
import com.smartev.service.ChargingSessionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/charging")
@CrossOrigin(origins = "*")
public class ChargingSessionController {

    private final ChargingSessionService sessionService;

    public ChargingSessionController(ChargingSessionService sessionService) {
        this.sessionService = sessionService;
    }

    @PostMapping("/start")
    public ResponseEntity<ChargingSession> startSession(@RequestBody Map<String, Object> req) {
        String deviceId = (String) req.get("deviceId");
        Long stationId = req.get("stationId") != null ? Long.valueOf(req.get("stationId").toString()) : 1L;
        Double startSoc = req.get("startSoc") != null ? Double.valueOf(req.get("startSoc").toString()) : 35.0;
        Double targetSoc = req.get("targetSoc") != null ? Double.valueOf(req.get("targetSoc").toString()) : 90.0;

        return ResponseEntity.ok(sessionService.startSession(deviceId, stationId, startSoc, targetSoc));
    }

    @PostMapping("/{sessionId}/stop")
    public ResponseEntity<ChargingSession> stopSession(@PathVariable String sessionId) {
        return ResponseEntity.ok(sessionService.stopSession(sessionId));
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<?> getSession(@PathVariable String sessionId) {
        return sessionService.getSession(sessionId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/active")
    public ResponseEntity<?> getActiveSession(@RequestParam String deviceId) {
        return sessionService.getActiveSessionForDevice(deviceId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/history")
    public ResponseEntity<List<ChargingSession>> getSessionHistory(@RequestParam String deviceId) {
        return ResponseEntity.ok(sessionService.getDeviceSessionHistory(deviceId));
    }
}
