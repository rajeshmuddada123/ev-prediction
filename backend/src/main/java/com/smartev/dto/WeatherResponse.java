package com.smartev.dto;

import java.util.List;

public class WeatherResponse {
    private Double latitude;
    private Double longitude;
    private String cityName;
    private Double temperature;
    private Double apparentTemperature;
    private Integer relativeHumidity;
    private Double precipitationMm;
    private Integer precipitationProbability;
    private Double cloudCover;
    private Double windSpeedKmh;
    private Integer weatherCode;
    private String weatherDescription;
    private String iconCode;
    private Double uvIndex;
    private Double evRangeImpactPercentage; // negative or positive impact factor on range
    private String evRangeImpactSummary;
    private List<HourlyWeather> hourly;

    public static class HourlyWeather {
        private String time;
        private Double temperature;
        private Integer precipitationProbability;
        private Double cloudCover;
        private Double windSpeed;

        public HourlyWeather() {}

        public HourlyWeather(String time, Double temperature, Integer precipitationProbability, Double cloudCover, Double windSpeed) {
            this.time = time;
            this.temperature = temperature;
            this.precipitationProbability = precipitationProbability;
            this.cloudCover = cloudCover;
            this.windSpeed = windSpeed;
        }

        public String getTime() { return time; }
        public void setTime(String time) { this.time = time; }
        public Double getTemperature() { return temperature; }
        public void setTemperature(Double temperature) { this.temperature = temperature; }
        public Integer getPrecipitationProbability() { return precipitationProbability; }
        public void setPrecipitationProbability(Integer precipitationProbability) { this.precipitationProbability = precipitationProbability; }
        public Double getCloudCover() { return cloudCover; }
        public void setCloudCover(Double cloudCover) { this.cloudCover = cloudCover; }
        public Double getWindSpeed() { return windSpeed; }
        public void setWindSpeed(Double windSpeed) { this.windSpeed = windSpeed; }
    }

    public WeatherResponse() {}

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public String getCityName() { return cityName; }
    public void setCityName(String cityName) { this.cityName = cityName; }
    public Double getTemperature() { return temperature; }
    public void setTemperature(Double temperature) { this.temperature = temperature; }
    public Double getApparentTemperature() { return apparentTemperature; }
    public void setApparentTemperature(Double apparentTemperature) { this.apparentTemperature = apparentTemperature; }
    public Integer getRelativeHumidity() { return relativeHumidity; }
    public void setRelativeHumidity(Integer relativeHumidity) { this.relativeHumidity = relativeHumidity; }
    public Double getPrecipitationMm() { return precipitationMm; }
    public void setPrecipitationMm(Double precipitationMm) { this.precipitationMm = precipitationMm; }
    public Integer getPrecipitationProbability() { return precipitationProbability; }
    public void setPrecipitationProbability(Integer precipitationProbability) { this.precipitationProbability = precipitationProbability; }
    public Double getCloudCover() { return cloudCover; }
    public void setCloudCover(Double cloudCover) { this.cloudCover = cloudCover; }
    public Double getWindSpeedKmh() { return windSpeedKmh; }
    public void setWindSpeedKmh(Double windSpeedKmh) { this.windSpeedKmh = windSpeedKmh; }
    public Integer getWeatherCode() { return weatherCode; }
    public void setWeatherCode(Integer weatherCode) { this.weatherCode = weatherCode; }
    public String getWeatherDescription() { return weatherDescription; }
    public void setWeatherDescription(String weatherDescription) { this.weatherDescription = weatherDescription; }
    public String getIconCode() { return iconCode; }
    public void setIconCode(String iconCode) { this.iconCode = iconCode; }
    public Double getUvIndex() { return uvIndex; }
    public void setUvIndex(Double uvIndex) { this.uvIndex = uvIndex; }
    public Double getEvRangeImpactPercentage() { return evRangeImpactPercentage; }
    public void setEvRangeImpactPercentage(Double evRangeImpactPercentage) { this.evRangeImpactPercentage = evRangeImpactPercentage; }
    public String getEvRangeImpactSummary() { return evRangeImpactSummary; }
    public void setEvRangeImpactSummary(String evRangeImpactSummary) { this.evRangeImpactSummary = evRangeImpactSummary; }
    public List<HourlyWeather> getHourly() { return hourly; }
    public void setHourly(List<HourlyWeather> hourly) { this.hourly = hourly; }
}
