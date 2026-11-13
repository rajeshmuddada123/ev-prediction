package com.smartev.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "charging_stations")
public class ChargingStation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String stationCode;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 100)
    private String operatorName;

    @Column(nullable = false, length = 255)
    private String address;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    private Integer totalChargers = 4;
    private Integer availableChargers = 3;
    private Integer occupiedChargers = 1;
    private Integer offlineChargers = 0;

    private Double maxPowerKw = 120.0;
    private String operatingHours = "24/7";
    private Double costPerKwh = 18.5; // in local currency (e.g., INR or units)
    private Boolean isLiveStatus = true;
    private LocalDateTime statusTimestamp = LocalDateTime.now();

    @Transient
    private Double distanceKm;

    @OneToMany(mappedBy = "station", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<ChargingConnector> connectors = new ArrayList<>();

    public ChargingStation() {}

    public ChargingStation(String stationCode, String name, String operatorName, String address, String city,
                           Double latitude, Double longitude, Integer totalChargers, Integer availableChargers,
                           Integer occupiedChargers, Double maxPowerKw, Double costPerKwh) {
        this.stationCode = stationCode;
        this.name = name;
        this.operatorName = operatorName;
        this.address = address;
        this.city = city;
        this.latitude = latitude;
        this.longitude = longitude;
        this.totalChargers = totalChargers;
        this.availableChargers = availableChargers;
        this.occupiedChargers = occupiedChargers;
        this.offlineChargers = Math.max(0, totalChargers - availableChargers - occupiedChargers);
        this.maxPowerKw = maxPowerKw;
        this.costPerKwh = costPerKwh;
        this.statusTimestamp = LocalDateTime.now();
    }

    public void addConnector(ChargingConnector connector) {
        connectors.add(connector);
        connector.setStation(this);
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStationCode() { return stationCode; }
    public void setStationCode(String stationCode) { this.stationCode = stationCode; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getOperatorName() { return operatorName; }
    public void setOperatorName(String operatorName) { this.operatorName = operatorName; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Integer getTotalChargers() { return totalChargers; }
    public void setTotalChargers(Integer totalChargers) { this.totalChargers = totalChargers; }

    public Integer getAvailableChargers() { return availableChargers; }
    public void setAvailableChargers(Integer availableChargers) { this.availableChargers = availableChargers; }

    public Integer getOccupiedChargers() { return occupiedChargers; }
    public void setOccupiedChargers(Integer occupiedChargers) { this.occupiedChargers = occupiedChargers; }

    public Integer getOfflineChargers() { return offlineChargers; }
    public void setOfflineChargers(Integer offlineChargers) { this.offlineChargers = offlineChargers; }

    public Double getMaxPowerKw() { return maxPowerKw; }
    public void setMaxPowerKw(Double maxPowerKw) { this.maxPowerKw = maxPowerKw; }

    public String getOperatingHours() { return operatingHours; }
    public void setOperatingHours(String operatingHours) { this.operatingHours = operatingHours; }

    public Double getCostPerKwh() { return costPerKwh; }
    public void setCostPerKwh(Double costPerKwh) { this.costPerKwh = costPerKwh; }

    public Boolean getIsLiveStatus() { return isLiveStatus; }
    public void setIsLiveStatus(Boolean liveStatus) { isLiveStatus = liveStatus; }

    public LocalDateTime getStatusTimestamp() { return statusTimestamp; }
    public void setStatusTimestamp(LocalDateTime statusTimestamp) { this.statusTimestamp = statusTimestamp; }

    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }

    public List<ChargingConnector> getConnectors() { return connectors; }
    public void setConnectors(List<ChargingConnector> connectors) { this.connectors = connectors; }
}
