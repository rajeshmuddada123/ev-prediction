package com.smartev.dto;

public class TrackingUpdateRequest {
    private String deviceId;
    private Long targetStationId;
    private Double latitude;
    private Double longitude;
    private Double speedKmh;
    private Double heading;
    private Double batteryPercentage;

    public TrackingUpdateRequest() {}

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
}
