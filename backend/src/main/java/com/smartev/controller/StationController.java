package com.smartev.controller;

import com.smartev.model.ChargingSlot;
import com.smartev.model.ChargingStation;
import com.smartev.service.StationService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/stations")
public class StationController {

    private final StationService stationService;

    public StationController(StationService stationService) {
        this.stationService = stationService;
    }

    @GetMapping
    public ResponseEntity<List<ChargingStation>> getStations(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon,
            @RequestParam(required = false) Double radius,
            @RequestParam(required = false) String connectorType,
            @RequestParam(required = false) Double minPower,
            @RequestParam(required = false) String search) {

        List<ChargingStation> stations = stationService.getNearbyStations(lat, lon, radius, connectorType, minPower, search);
        return ResponseEntity.ok(stations);
    }

    @GetMapping("/overpass")
    public ResponseEntity<List<ChargingStation>> getOverpassStations(
            @RequestParam Double lat,
            @RequestParam Double lon,
            @RequestParam(defaultValue = "10000") Double radiusMeters) {

        return ResponseEntity.ok(stationService.fetchOverpassChargingStations(lat, lon, radiusMeters));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChargingStation> getStationById(
            @PathVariable Long id,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon) {

        return stationService.getStationById(id, lat, lon)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/slots")
    public ResponseEntity<List<ChargingSlot>> getSlots(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        return ResponseEntity.ok(stationService.getSlotsForStation(id, date));
    }
}
