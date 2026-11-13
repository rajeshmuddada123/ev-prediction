package com.smartev.dto;

import java.util.List;
import java.util.Map;

public class SolarForecastResponse {
    private String mode; // MODE_A_POTENTIAL or MODE_B_INSTALLED
    private String locationName;
    private Double latitude;
    private Double longitude;
    private Double currentIrradianceWm2;
    private String sunlightIntensity; // Low, Moderate, High, Peak
    private Double currentPowerKw;
    private Double energyGeneratedTodayKwh;
    private Double peakPowerTodayKw;
    private Double cloudCoverPercentage;
    private Double temperatureC;
    private String weatherCondition;
    private String sunriseTime;
    private String sunsetTime;
    private Double systemCapacityKw;
    private Double panelEfficiencyPct;
    private String measurementDistinction; // Explicit note about estimation vs direct meter
    private List<HourlySolarData> hourlyForecast;
    private SolarRecommendation recommendation;

    public static class HourlySolarData {
        private String time;
        private Double irradianceWm2;
        private Double estimatedPowerKw;
        private Double cloudCover;

        public HourlySolarData() {}

        public HourlySolarData(String time, Double irradianceWm2, Double estimatedPowerKw, Double cloudCover) {
            this.time = time;
            this.irradianceWm2 = irradianceWm2;
            this.estimatedPowerKw = estimatedPowerKw;
            this.cloudCover = cloudCover;
        }

        public String getTime() { return time; }
        public void setTime(String time) { this.time = time; }
        public Double getIrradianceWm2() { return irradianceWm2; }
        public void setIrradianceWm2(Double irradianceWm2) { this.irradianceWm2 = irradianceWm2; }
        public Double getEstimatedPowerKw() { return estimatedPowerKw; }
        public void setEstimatedPowerKw(Double estimatedPowerKw) { this.estimatedPowerKw = estimatedPowerKw; }
        public Double getCloudCover() { return cloudCover; }
        public void setCloudCover(Double cloudCover) { this.cloudCover = cloudCover; }
    }

    public static class SolarRecommendation {
        private String optimalWindowStart;
        private String optimalWindowEnd;
        private Double availableSolarKwh;
        private Double solarSharePercentage;
        private Double gridSharePercentage;
        private Double estimatedSavings;
        private Double estimatedCo2SavedKg;
        private String advice;

        public SolarRecommendation() {}

        public String getOptimalWindowStart() { return optimalWindowStart; }
        public void setOptimalWindowStart(String optimalWindowStart) { this.optimalWindowStart = optimalWindowStart; }
        public String getOptimalWindowEnd() { return optimalWindowEnd; }
        public void setOptimalWindowEnd(String optimalWindowEnd) { this.optimalWindowEnd = optimalWindowEnd; }
        public Double getAvailableSolarKwh() { return availableSolarKwh; }
        public void setAvailableSolarKwh(Double availableSolarKwh) { this.availableSolarKwh = availableSolarKwh; }
        public Double getSolarSharePercentage() { return solarSharePercentage; }
        public void setSolarSharePercentage(Double solarSharePercentage) { this.solarSharePercentage = solarSharePercentage; }
        public Double getGridSharePercentage() { return gridSharePercentage; }
        public void setGridSharePercentage(Double gridSharePercentage) { this.gridSharePercentage = gridSharePercentage; }
        public Double getEstimatedSavings() { return estimatedSavings; }
        public void setEstimatedSavings(Double estimatedSavings) { this.estimatedSavings = estimatedSavings; }
        public Double getEstimatedCo2SavedKg() { return estimatedCo2SavedKg; }
        public void setEstimatedCo2SavedKg(Double estimatedCo2SavedKg) { this.estimatedCo2SavedKg = estimatedCo2SavedKg; }
        public String getAdvice() { return advice; }
        public void setAdvice(String advice) { this.advice = advice; }
    }

    public SolarForecastResponse() {}

    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }
    public String getLocationName() { return locationName; }
    public void setLocationName(String locationName) { this.locationName = locationName; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public Double getCurrentIrradianceWm2() { return currentIrradianceWm2; }
    public void setCurrentIrradianceWm2(Double currentIrradianceWm2) { this.currentIrradianceWm2 = currentIrradianceWm2; }
    public String getSunlightIntensity() { return sunlightIntensity; }
    public void setSunlightIntensity(String sunlightIntensity) { this.sunlightIntensity = sunlightIntensity; }
    public Double getCurrentPowerKw() { return currentPowerKw; }
    public void setCurrentPowerKw(Double currentPowerKw) { this.currentPowerKw = currentPowerKw; }
    public Double getEnergyGeneratedTodayKwh() { return energyGeneratedTodayKwh; }
    public void setEnergyGeneratedTodayKwh(Double energyGeneratedTodayKwh) { this.energyGeneratedTodayKwh = energyGeneratedTodayKwh; }
    public Double getPeakPowerTodayKw() { return peakPowerTodayKw; }
    public void setPeakPowerTodayKw(Double peakPowerTodayKw) { this.peakPowerTodayKw = peakPowerTodayKw; }
    public Double getCloudCoverPercentage() { return cloudCoverPercentage; }
    public void setCloudCoverPercentage(Double cloudCoverPercentage) { this.cloudCoverPercentage = cloudCoverPercentage; }
    public Double getTemperatureC() { return temperatureC; }
    public void setTemperatureC(Double temperatureC) { this.temperatureC = temperatureC; }
    public String getWeatherCondition() { return weatherCondition; }
    public void setWeatherCondition(String weatherCondition) { this.weatherCondition = weatherCondition; }
    public String getSunriseTime() { return sunriseTime; }
    public void setSunriseTime(String sunriseTime) { this.sunriseTime = sunriseTime; }
    public String getSunsetTime() { return sunsetTime; }
    public void setSunsetTime(String sunsetTime) { this.sunsetTime = sunsetTime; }
    public Double getSystemCapacityKw() { return systemCapacityKw; }
    public void setSystemCapacityKw(Double systemCapacityKw) { this.systemCapacityKw = systemCapacityKw; }
    public Double getPanelEfficiencyPct() { return panelEfficiencyPct; }
    public void setPanelEfficiencyPct(Double panelEfficiencyPct) { this.panelEfficiencyPct = panelEfficiencyPct; }
    public String getMeasurementDistinction() { return measurementDistinction; }
    public void setMeasurementDistinction(String measurementDistinction) { this.measurementDistinction = measurementDistinction; }
    public List<HourlySolarData> getHourlyForecast() { return hourlyForecast; }
    public void setHourlyForecast(List<HourlySolarData> hourlyForecast) { this.hourlyForecast = hourlyForecast; }
    public SolarRecommendation getRecommendation() { return recommendation; }
    public void setRecommendation(SolarRecommendation recommendation) { this.recommendation = recommendation; }
}
