package com.smartev.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "solar_generation_history")
public class SolarGenerationRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String deviceId;

    @Column(nullable = false)
    private LocalDate recordedDate;

    private Double solarIrradianceWm2;
    private Double generationKwh;
    private Double peakPowerKw;
    private Double carbonOffsetKg;

    public SolarGenerationRecord() {}

    public SolarGenerationRecord(String deviceId, LocalDate recordedDate, Double solarIrradianceWm2,
                                 Double generationKwh, Double peakPowerKw, Double carbonOffsetKg) {
        this.deviceId = deviceId;
        this.recordedDate = recordedDate;
        this.solarIrradianceWm2 = solarIrradianceWm2;
        this.generationKwh = generationKwh;
        this.peakPowerKw = peakPowerKw;
        this.carbonOffsetKg = carbonOffsetKg;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }

    public LocalDate getRecordedDate() { return recordedDate; }
    public void setRecordedDate(LocalDate recordedDate) { this.recordedDate = recordedDate; }

    public Double getSolarIrradianceWm2() { return solarIrradianceWm2; }
    public void setSolarIrradianceWm2(Double solarIrradianceWm2) { this.solarIrradianceWm2 = solarIrradianceWm2; }

    public Double getGenerationKwh() { return generationKwh; }
    public void setGenerationKwh(Double generationKwh) { this.generationKwh = generationKwh; }

    public Double getPeakPowerKw() { return peakPowerKw; }
    public void setPeakPowerKw(Double peakPowerKw) { this.peakPowerKw = peakPowerKw; }

    public Double getCarbonOffsetKg() { return carbonOffsetKg; }
    public void setCarbonOffsetKg(Double carbonOffsetKg) { this.carbonOffsetKg = carbonOffsetKg; }
}
