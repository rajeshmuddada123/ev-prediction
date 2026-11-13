package com.smartev.controller;

import com.smartev.model.VehicleConfig;
import com.smartev.repository.VehicleConfigRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/vehicle")
@CrossOrigin(origins = "*")
public class VehicleController {

    private final VehicleConfigRepository vehicleConfigRepository;

    public VehicleController(VehicleConfigRepository vehicleConfigRepository) {
        this.vehicleConfigRepository = vehicleConfigRepository;
    }

    @GetMapping
    public ResponseEntity<VehicleConfig> getVehicle(@RequestParam String deviceId) {
        VehicleConfig config = vehicleConfigRepository.findByDeviceId(deviceId)
                .orElseGet(() -> new VehicleConfig(deviceId, "Tata Motors", "Nexon EV Max", 40.5, 75.0, 7.2, "CCS2"));
        return ResponseEntity.ok(config);
    }

    @PostMapping
    public ResponseEntity<VehicleConfig> saveVehicle(@RequestParam String deviceId, @RequestBody VehicleConfig updated) {
        VehicleConfig config = vehicleConfigRepository.findByDeviceId(deviceId)
                .orElse(new VehicleConfig());

        config.setDeviceId(deviceId);
        config.setBrand(updated.getBrand() != null ? updated.getBrand() : "Tata Motors");
        config.setModel(updated.getModel() != null ? updated.getModel() : "Nexon EV Max");
        config.setBatteryCapacityKwh(updated.getBatteryCapacityKwh() != null ? updated.getBatteryCapacityKwh() : 40.5);
        config.setCurrentSocPercentage(updated.getCurrentSocPercentage() != null ? updated.getCurrentSocPercentage() : 75.0);
        config.setEfficiencyKmPerKwh(updated.getEfficiencyKmPerKwh() != null ? updated.getEfficiencyKmPerKwh() : 7.2);
        config.setConnectorType(updated.getConnectorType() != null ? updated.getConnectorType() : "CCS2");
        config.setIsManualEntry(true);
        config.setUpdatedAt(LocalDateTime.now());

        VehicleConfig saved = vehicleConfigRepository.save(config);
        return ResponseEntity.ok(saved);
    }
}
