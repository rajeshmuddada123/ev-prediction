package com.smartev.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vehicles")
public class VehicleConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String deviceId;

    @Column(nullable = false, length = 100)
    private String brand;

    @Column(nullable = false, length = 100)
    private String model;

    @Column(nullable = false)
    private Double batteryCapacityKwh;

    @Column(nullable = false)
    private Double currentSocPercentage;

    @Column(nullable = false)
    private Double efficiencyKmPerKwh;

    @Column(length = 50)
    private String connectorType = "CCS2";

    private Boolean isManualEntry = true;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public VehicleConfig() {}

    public VehicleConfig(String deviceId, String brand, String model, Double batteryCapacityKwh,
                         Double currentSocPercentage, Double efficiencyKmPerKwh, String connectorType) {
        this.deviceId = deviceId;
        this.brand = brand;
        this.model = model;
        this.batteryCapacityKwh = batteryCapacityKwh;
        this.currentSocPercentage = currentSocPercentage;
        this.efficiencyKmPerKwh = efficiencyKmPerKwh;
        this.connectorType = connectorType;
        this.isManualEntry = true;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Double getRemainingEnergyKwh() {
        if (batteryCapacityKwh == null || currentSocPercentage == null) return 0.0;
        return (batteryCapacityKwh * currentSocPercentage) / 100.0;
    }

    public Double getEstimatedRangeKm() {
        if (efficiencyKmPerKwh == null) return 0.0;
        return Math.round(getRemainingEnergyKwh() * efficiencyKmPerKwh * 10.0) / 10.0;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public Double getBatteryCapacityKwh() { return batteryCapacityKwh; }
    public void setBatteryCapacityKwh(Double batteryCapacityKwh) { this.batteryCapacityKwh = batteryCapacityKwh; }

    public Double getCurrentSocPercentage() { return currentSocPercentage; }
    public void setCurrentSocPercentage(Double currentSocPercentage) { this.currentSocPercentage = currentSocPercentage; }

    public Double getEfficiencyKmPerKwh() { return efficiencyKmPerKwh; }
    public void setEfficiencyKmPerKwh(Double efficiencyKmPerKwh) { this.efficiencyKmPerKwh = efficiencyKmPerKwh; }

    public String getConnectorType() { return connectorType; }
    public void setConnectorType(String connectorType) { this.connectorType = connectorType; }

    public Boolean getIsManualEntry() { return isManualEntry; }
    public void setIsManualEntry(Boolean isManualEntry) { this.isManualEntry = isManualEntry; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
