package com.smartev.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "charging_sessions")
public class ChargingSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String sessionId;

    @Column(nullable = false, length = 100)
    private String deviceId;

    private Long stationId;
    private String stationName;

    private Double startSoc;
    private Double currentSoc;
    private Double targetSoc;
    private Double powerKw;
    private Double energyDeliveredKwh;
    private Long durationSeconds;

    @Column(length = 30)
    private String status = "IN_PROGRESS"; // IN_PROGRESS, COMPLETED, STOPPED

    private Boolean isSimulated = true;
    private LocalDateTime startedAt = LocalDateTime.now();
    private LocalDateTime endedAt;

    public ChargingSession() {}

    public ChargingSession(String sessionId, String deviceId, Long stationId, String stationName,
                           Double startSoc, Double targetSoc, Double powerKw) {
        this.sessionId = sessionId;
        this.deviceId = deviceId;
        this.stationId = stationId;
        this.stationName = stationName;
        this.startSoc = startSoc;
        this.currentSoc = startSoc;
        this.targetSoc = targetSoc;
        this.powerKw = powerKw;
        this.energyDeliveredKwh = 0.0;
        this.durationSeconds = 0L;
        this.status = "IN_PROGRESS";
        this.isSimulated = true;
        this.startedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }

    public Long getStationId() { return stationId; }
    public void setStationId(Long stationId) { this.stationId = stationId; }

    public String getStationName() { return stationName; }
    public void setStationName(String stationName) { this.stationName = stationName; }

    public Double getStartSoc() { return startSoc; }
    public void setStartSoc(Double startSoc) { this.startSoc = startSoc; }

    public Double getCurrentSoc() { return currentSoc; }
    public void setCurrentSoc(Double currentSoc) { this.currentSoc = currentSoc; }

    public Double getTargetSoc() { return targetSoc; }
    public void setTargetSoc(Double targetSoc) { this.targetSoc = targetSoc; }

    public Double getPowerKw() { return powerKw; }
    public void setPowerKw(Double powerKw) { this.powerKw = powerKw; }

    public Double getEnergyDeliveredKwh() { return energyDeliveredKwh; }
    public void setEnergyDeliveredKwh(Double energyDeliveredKwh) { this.energyDeliveredKwh = energyDeliveredKwh; }

    public Long getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Long durationSeconds) { this.durationSeconds = durationSeconds; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Boolean getIsSimulated() { return isSimulated; }
    public void setIsSimulated(Boolean isSimulated) { this.isSimulated = isSimulated; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getEndedAt() { return endedAt; }
    public void setEndedAt(LocalDateTime endedAt) { this.endedAt = endedAt; }
}
