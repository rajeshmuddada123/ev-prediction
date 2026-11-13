package com.smartev.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "solar_systems")
public class SolarSystemConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String deviceId;

    @Column(length = 20)
    private String systemType = "INSTALLED"; // POTENTIAL or INSTALLED

    private Double systemCapacityKw = 5.0;
    private Double panelEfficiencyPct = 19.5;
    private Double tiltAngle = 20.0;
    private String locationName = "Current Location";
    private Double latitude = 28.6139;
    private Double longitude = 77.2090;

    private LocalDateTime updatedAt = LocalDateTime.now();

    public SolarSystemConfig() {}

    public SolarSystemConfig(String deviceId, String systemType, Double systemCapacityKw,
                             Double panelEfficiencyPct, Double tiltAngle, String locationName,
                             Double latitude, Double longitude) {
        this.deviceId = deviceId;
        this.systemType = systemType;
        this.systemCapacityKw = systemCapacityKw;
        this.panelEfficiencyPct = panelEfficiencyPct;
        this.tiltAngle = tiltAngle;
        this.locationName = locationName;
        this.latitude = latitude;
        this.longitude = longitude;
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }

    public String getSystemType() { return systemType; }
    public void setSystemType(String systemType) { this.systemType = systemType; }

    public Double getSystemCapacityKw() { return systemCapacityKw; }
    public void setSystemCapacityKw(Double systemCapacityKw) { this.systemCapacityKw = systemCapacityKw; }

    public Double getPanelEfficiencyPct() { return panelEfficiencyPct; }
    public void setPanelEfficiencyPct(Double panelEfficiencyPct) { this.panelEfficiencyPct = panelEfficiencyPct; }

    public Double getTiltAngle() { return tiltAngle; }
    public void setTiltAngle(Double tiltAngle) { this.tiltAngle = tiltAngle; }

    public String getLocationName() { return locationName; }
    public void setLocationName(String locationName) { this.locationName = locationName; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
