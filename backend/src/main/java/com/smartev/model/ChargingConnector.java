package com.smartev.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "charging_connectors")
public class ChargingConnector {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "station_id", nullable = false)
    @JsonIgnore
    private ChargingStation station;

    @Column(nullable = false, length = 50)
    private String connectorType; // CCS2, Type 2, CHAdeMO, GB/T

    @Column(nullable = false)
    private Double powerKw;

    @Column(length = 20)
    private String currentType = "DC"; // AC or DC

    @Column(length = 30)
    private String status = "AVAILABLE"; // AVAILABLE, CHARGING, OFFLINE

    public ChargingConnector() {}

    public ChargingConnector(String connectorType, Double powerKw, String currentType, String status) {
        this.connectorType = connectorType;
        this.powerKw = powerKw;
        this.currentType = currentType;
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ChargingStation getStation() { return station; }
    public void setStation(ChargingStation station) { this.station = station; }

    public String getConnectorType() { return connectorType; }
    public void setConnectorType(String connectorType) { this.connectorType = connectorType; }

    public Double getPowerKw() { return powerKw; }
    public void setPowerKw(Double powerKw) { this.powerKw = powerKw; }

    public String getCurrentType() { return currentType; }
    public void setCurrentType(String currentType) { this.currentType = currentType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
