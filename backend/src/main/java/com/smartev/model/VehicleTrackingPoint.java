package com.smartev.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vehicle_tracking_history")
public class VehicleTrackingPoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String deviceId;

    private Long targetStationId;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    private Double speedKmh = 0.0;
    private Double heading = 0.0;
    private Double batteryPercentage;
    private Double remainingDistanceKm;
    private Integer estimatedArrivalMinutes;

    private LocalDateTime recordedAt = LocalDateTime.now();

    public VehicleTrackingPoint() {}

    public VehicleTrackingPoint(String deviceId, Long targetStationId, Double latitude, Double longitude,
                                Double speedKmh, Double heading, Double batteryPercentage,
                                Double remainingDistanceKm, Integer estimatedArrivalMinutes) {
        this.deviceId = deviceId;
        this.targetStationId = targetStationId;
        this.latitude = latitude;
        this.longitude = longitude;
        this.speedKmh = speedKmh;
        this.heading = heading;
        this.batteryPercentage = batteryPercentage;
        this.remainingDistanceKm = remainingDistanceKm;
        this.estimatedArrivalMinutes = estimatedArrivalMinutes;
        this.recordedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }

    public Long getTargetStationId() { return targetStationId; }
    public void setTargetStationId(Long targetStationId) { this.targetStationId = targetStationId; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Double getSpeedKmh() { return speedKmh; }
    public void setSpeedKmh(Double speedKmh) { this.speedKmh = speedKmh; }

    public Double getHeading() { return heading; }
    public void setHeading(Double heading) { this.heading = heading; }

    public Double getBatteryPercentage() { return batteryPercentage; }
    public void setBatteryPercentage(Double batteryPercentage) { this.batteryPercentage = batteryPercentage; }

    public Double getRemainingDistanceKm() { return remainingDistanceKm; }
    public void setRemainingDistanceKm(Double remainingDistanceKm) { this.remainingDistanceKm = remainingDistanceKm; }

    public Integer getEstimatedArrivalMinutes() { return estimatedArrivalMinutes; }
    public void setEstimatedArrivalMinutes(Integer estimatedArrivalMinutes) { this.estimatedArrivalMinutes = estimatedArrivalMinutes; }

    public LocalDateTime getRecordedAt() { return recordedAt; }
    public void setRecordedAt(LocalDateTime recordedAt) { this.recordedAt = recordedAt; }
}
