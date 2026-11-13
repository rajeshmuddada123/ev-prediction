package com.smartev.dto;

public class RangePredictionRequest {
    private Double batteryPercentage; // e.g. 75.0
    private Double batteryCapacityKwh; // e.g. 40.0
    private Double vehicleEfficiencyKmPerKwh; // e.g. 7.0
    private Double journeyDistanceKm; // e.g. 85.0

    // Environmental & driving factors
    private Double ambientTemperatureC = 25.0; // 25C optimal, <10C cold degradation, >35C HVAC load
    private String trafficCondition = "NORMAL"; // LIGHT, NORMAL, HEAVY, CONGESTED
    private String roadTerrain = "FLAT"; // FLAT, HILLY, HIGHWAY, CITY_MIXED
    private Boolean acOn = true;
    private Double windSpeedKmh = 10.0;
    private Long targetStationId;

    public RangePredictionRequest() {}

    public Double getBatteryPercentage() { return batteryPercentage; }
    public void setBatteryPercentage(Double batteryPercentage) { this.batteryPercentage = batteryPercentage; }

    public Double getBatteryCapacityKwh() { return batteryCapacityKwh; }
    public void setBatteryCapacityKwh(Double batteryCapacityKwh) { this.batteryCapacityKwh = batteryCapacityKwh; }

    public Double getVehicleEfficiencyKmPerKwh() { return vehicleEfficiencyKmPerKwh; }
    public void setVehicleEfficiencyKmPerKwh(Double vehicleEfficiencyKmPerKwh) { this.vehicleEfficiencyKmPerKwh = vehicleEfficiencyKmPerKwh; }

    public Double getJourneyDistanceKm() { return journeyDistanceKm; }
    public void setJourneyDistanceKm(Double journeyDistanceKm) { this.journeyDistanceKm = journeyDistanceKm; }

    public Double getAmbientTemperatureC() { return ambientTemperatureC; }
    public void setAmbientTemperatureC(Double ambientTemperatureC) { this.ambientTemperatureC = ambientTemperatureC; }

    public String getTrafficCondition() { return trafficCondition; }
    public void setTrafficCondition(String trafficCondition) { this.trafficCondition = trafficCondition; }

    public String getRoadTerrain() { return roadTerrain; }
    public void setRoadTerrain(String roadTerrain) { this.roadTerrain = roadTerrain; }

    public Boolean getAcOn() { return acOn; }
    public void setAcOn(Boolean acOn) { this.acOn = acOn; }

    public Double getWindSpeedKmh() { return windSpeedKmh; }
    public void setWindSpeedKmh(Double windSpeedKmh) { this.windSpeedKmh = windSpeedKmh; }

    public Long getTargetStationId() { return targetStationId; }
    public void setTargetStationId(Long targetStationId) { this.targetStationId = targetStationId; }
}
