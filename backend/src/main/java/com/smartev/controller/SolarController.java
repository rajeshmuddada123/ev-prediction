package com.smartev.controller;

import com.smartev.dto.SolarForecastResponse;
import com.smartev.model.SolarSystemConfig;
import com.smartev.service.SolarService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/solar")
@CrossOrigin(origins = "*")
public class SolarController {

    private final SolarService solarService;

    public SolarController(SolarService solarService) {
        this.solarService = solarService;
    }

    @GetMapping("/monitor")
    public ResponseEntity<SolarForecastResponse> getSolarMonitoring(
            @RequestParam(required = false) String deviceId,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon,
            @RequestParam(required = false) String mode,
            @RequestParam(required = false) Double capacity,
            @RequestParam(required = false) Double efficiency) {

        return ResponseEntity.ok(solarService.getSolarMonitoring(deviceId, lat, lon, mode, capacity, efficiency));
    }

    @PostMapping("/config")
    public ResponseEntity<SolarSystemConfig> saveConfig(
            @RequestParam String deviceId,
            @RequestBody SolarSystemConfig config) {

        return ResponseEntity.ok(solarService.saveOrUpdateConfig(deviceId, config));
    }
}
