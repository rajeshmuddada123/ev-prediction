package com.smartev.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String bookingId;

    @Column(nullable = false, length = 100)
    private String deviceId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "station_id", nullable = false)
    private ChargingStation station;

    @Column(nullable = false, length = 150)
    private String stationName;

    @Column(nullable = false)
    private LocalDate slotDate;

    @Column(nullable = false, length = 50)
    private String slotTime;

    private Integer durationMinutes = 60;

    @Column(nullable = false, length = 50)
    private String connectorType = "CCS2";

    private String vehicleModel;

    private Double estimatedEnergyKwh;
    private Double estimatedCost;

    @Column(length = 30)
    private String status = "CONFIRMED"; // CONFIRMED, COMPLETED, CANCELLED, RESCHEDULED

    private LocalDateTime createdAt = LocalDateTime.now();

    public Booking() {}

    public Booking(String bookingId, String deviceId, ChargingStation station, String stationName,
                   LocalDate slotDate, String slotTime, Integer durationMinutes, String connectorType,
                   String vehicleModel, Double estimatedEnergyKwh, Double estimatedCost) {
        this.bookingId = bookingId;
        this.deviceId = deviceId;
        this.station = station;
        this.stationName = stationName;
        this.slotDate = slotDate;
        this.slotTime = slotTime;
        this.durationMinutes = durationMinutes;
        this.connectorType = connectorType;
        this.vehicleModel = vehicleModel;
        this.estimatedEnergyKwh = estimatedEnergyKwh;
        this.estimatedCost = estimatedCost;
        this.status = "CONFIRMED";
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBookingId() { return bookingId; }
    public void setBookingId(String bookingId) { this.bookingId = bookingId; }

    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }

    public ChargingStation getStation() { return station; }
    public void setStation(ChargingStation station) { this.station = station; }

    public String getStationName() { return stationName; }
    public void setStationName(String stationName) { this.stationName = stationName; }

    public LocalDate getSlotDate() { return slotDate; }
    public void setSlotDate(LocalDate slotDate) { this.slotDate = slotDate; }

    public String getSlotTime() { return slotTime; }
    public void setSlotTime(String slotTime) { this.slotTime = slotTime; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public String getConnectorType() { return connectorType; }
    public void setConnectorType(String connectorType) { this.connectorType = connectorType; }

    public String getVehicleModel() { return vehicleModel; }
    public void setVehicleModel(String vehicleModel) { this.vehicleModel = vehicleModel; }

    public Double getEstimatedEnergyKwh() { return estimatedEnergyKwh; }
    public void setEstimatedEnergyKwh(Double estimatedEnergyKwh) { this.estimatedEnergyKwh = estimatedEnergyKwh; }

    public Double getEstimatedCost() { return estimatedCost; }
    public void setEstimatedCost(Double estimatedCost) { this.estimatedCost = estimatedCost; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
