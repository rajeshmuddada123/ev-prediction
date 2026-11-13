package com.smartev.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartev.dto.SolarForecastResponse;
import com.smartev.model.SolarSystemConfig;
import com.smartev.repository.SolarSystemConfigRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class SolarService {

    private final SolarSystemConfigRepository solarSystemConfigRepository;
    private final WeatherService weatherService;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public SolarService(SolarSystemConfigRepository solarSystemConfigRepository, WeatherService weatherService) {
        this.solarSystemConfigRepository = solarSystemConfigRepository;
        this.weatherService = weatherService;
    }

    public SolarForecastResponse getSolarMonitoring(String deviceId, Double lat, Double lon, String mode,
                                                    Double customCapacityKw, Double customEfficiencyPct) {
        if (lat == null || lon == null) {
            lat = 28.6139;
            lon = 77.2090;
        }

        // Retrieve saved user configuration if available
        SolarSystemConfig config = null;
        if (deviceId != null && !deviceId.isBlank()) {
            config = solarSystemConfigRepository.findByDeviceId(deviceId).orElse(null);
        }

        double systemCapacityKw = customCapacityKw != null ? customCapacityKw :
                (config != null && config.getSystemCapacityKw() != null ? config.getSystemCapacityKw() : 5.0);
        double panelEfficiency = customEfficiencyPct != null ? customEfficiencyPct :
                (config != null && config.getPanelEfficiencyPct() != null ? config.getPanelEfficiencyPct() : 19.5);
        String selectedMode = mode != null ? mode.toUpperCase() :
                (config != null && config.getSystemType() != null ? config.getSystemType() : "MODE_A_POTENTIAL");

        // Try Open-Meteo direct radiation query
        SolarForecastResponse resp = fetchOpenMeteoSolar(lat, lon, systemCapacityKw, panelEfficiency, selectedMode);
        if (resp == null) {
            resp = calculateAnalyticalSolar(lat, lon, systemCapacityKw, panelEfficiency, selectedMode);
        }

        return resp;
    }

    public SolarSystemConfig saveOrUpdateConfig(String deviceId, SolarSystemConfig newConfig) {
        SolarSystemConfig existing = solarSystemConfigRepository.findByDeviceId(deviceId)
                .orElse(new SolarSystemConfig());
        existing.setDeviceId(deviceId);
        existing.setSystemType(newConfig.getSystemType());
        existing.setSystemCapacityKw(newConfig.getSystemCapacityKw());
        existing.setPanelEfficiencyPct(newConfig.getPanelEfficiencyPct());
        existing.setTiltAngle(newConfig.getTiltAngle());
        existing.setLocationName(newConfig.getLocationName());
        existing.setLatitude(newConfig.getLatitude());
        existing.setLongitude(newConfig.getLongitude());
        existing.setUpdatedAt(LocalDateTime.now());
        return solarSystemConfigRepository.save(existing);
    }

    private SolarForecastResponse fetchOpenMeteoSolar(Double lat, Double lon, double capacityKw, double efficiencyPct, String mode) {
        try {
            String url = String.format(
                "https://api.open-meteo.com/v1/forecast?latitude=%.4f&longitude=%.4f" +
                "&current=temperature_2m,cloud_cover,weather_code,direct_radiation,diffuse_radiation,shortwave_radiation" +
                "&hourly=temperature_2m,cloud_cover,direct_radiation,diffuse_radiation,shortwave_radiation" +
                "&daily=sunrise,sunset&timezone=auto&forecast_days=1",
                lat, lon
            );

            String json = restTemplate.getForObject(url, String.class);
            if (json == null) return null;

            JsonNode root = objectMapper.readTree(json);
            JsonNode current = root.get("current");
            if (current == null) return null;

            double direct = current.has("direct_radiation") ? current.get("direct_radiation").asDouble() : 0.0;
            double diffuse = current.has("diffuse_radiation") ? current.get("diffuse_radiation").asDouble() : 0.0;
            double globalIrradiance = Math.max(0.0, direct + diffuse);

            // If night time, globalIrradiance is 0
            double cloudCover = current.has("cloud_cover") ? current.get("cloud_cover").asDouble() : 15.0;
            double temp = current.has("temperature_2m") ? current.get("temperature_2m").asDouble() : 26.0;

            String sunrise = "06:15";
            String sunset = "18:20";
            if (root.has("daily") && root.get("daily").has("sunrise")) {
                JsonNode sr = root.get("daily").get("sunrise");
                if (sr.size() > 0) {
                    String srStr = sr.get(0).asText();
                    sunrise = srStr.substring(srStr.indexOf("T") + 1);
                }
                JsonNode ss = root.get("daily").get("sunset");
                if (ss.size() > 0) {
                    String ssStr = ss.get(0).asText();
                    sunset = ssStr.substring(ssStr.indexOf("T") + 1);
                }
            }

            return buildSolarResponse(lat, lon, globalIrradiance, cloudCover, temp, sunrise, sunset, capacityKw, efficiencyPct, mode, root.get("hourly"));
        } catch (Exception e) {
            return null;
        }
    }

    private SolarForecastResponse calculateAnalyticalSolar(Double lat, Double lon, double capacityKw, double efficiencyPct, String mode) {
        LocalDateTime now = LocalDateTime.now();
        int hour = now.getHour();
        int minute = now.getMinute();
        double timeDecimal = hour + (minute / 60.0);

        double solarElevation = Math.sin((timeDecimal - 6.0) / 12.0 * Math.PI);
        double irradiance = 0.0;
        if (solarElevation > 0) {
            irradiance = Math.round(solarElevation * 880.0 * 10.0) / 10.0; // W/m² clear sky peak
        }

        double cloudCover = 15.0;
        double temp = 27.0;
        return buildSolarResponse(lat, lon, irradiance, cloudCover, temp, "06:12", "18:24", capacityKw, efficiencyPct, mode, null);
    }

    private SolarForecastResponse buildSolarResponse(Double lat, Double lon, double irradianceWm2, double cloudCover,
                                                    double tempC, String sunrise, String sunset,
                                                    double capacityKw, double efficiencyPct, String mode,
                                                    JsonNode hourlyNode) {
        SolarForecastResponse resp = new SolarForecastResponse();
        resp.setMode(mode);
        resp.setLatitude(lat);
        resp.setLongitude(lon);
        resp.setLocationName(lat != null ? String.format("Geo (%.2f, %.2f)", lat, lon) : "Current Location");
        resp.setCurrentIrradianceWm2(Math.round(irradianceWm2 * 10.0) / 10.0);
        resp.setCloudCoverPercentage(cloudCover);
        resp.setTemperatureC(tempC);
        resp.setSunriseTime(sunrise);
        resp.setSunsetTime(sunset);
        resp.setSystemCapacityKw(capacityKw);
        resp.setPanelEfficiencyPct(efficiencyPct);

        // Sunlight intensity categorisation
        if (irradianceWm2 > 750) {
            resp.setSunlightIntensity("Peak Irradiance (>750 W/m²)");
        } else if (irradianceWm2 > 450) {
            resp.setSunlightIntensity("High Irradiance (450-750 W/m²)");
        } else if (irradianceWm2 > 150) {
            resp.setSunlightIntensity("Moderate Irradiance (150-450 W/m²)");
        } else if (irradianceWm2 > 0) {
            resp.setSunlightIntensity("Low Irradiance (<150 W/m²)");
        } else {
            resp.setSunlightIntensity("Night / Zero Irradiance");
        }

        // Photovoltaic generation equation:
        // P_pv = SystemCapacity_kW * (Irradiance / 1000) * PerformanceRatio * TemperatureDerate
        // Derate: -0.4% per °C above 25°C standard cell temperature
        double cellTemp = tempC + (irradianceWm2 / 800.0) * 25.0;
        double tempDerate = 1.0 - Math.max(0, cellTemp - 25.0) * 0.004;
        double performanceRatio = 0.82; // Inverter, cable, dust factor

        double effectiveCapacity = mode.contains("POTENTIAL") ? 5.0 : capacityKw;
        double currentPower = Math.round(effectiveCapacity * (irradianceWm2 / 1000.0) * performanceRatio * tempDerate * 100.0) / 100.0;
        resp.setCurrentPowerKw(Math.max(0.0, currentPower));

        // Today's estimated generation (approx 4.6 peak sun hours * effective capacity)
        double todayKwh = Math.round(effectiveCapacity * 4.65 * (1.0 - cloudCover * 0.005) * 10.0) / 10.0;
        resp.setEnergyGeneratedTodayKwh(todayKwh);
        resp.setPeakPowerTodayKw(Math.round(effectiveCapacity * 0.88 * 10.0) / 10.0);

        resp.setMeasurementDistinction("Meteorological Irradiance & Photovoltaic Generation Model (Empirical Estimate). " +
                "Actual physical inverter output may vary based on inverter clipping, panel tilt, azimuth orientation, and dust accumulation.");

        // Build hourly forecast curve
        List<SolarForecastResponse.HourlySolarData> hourlyList = new ArrayList<>();
        if (hourlyNode != null && hourlyNode.has("time")) {
            JsonNode times = hourlyNode.get("time");
            JsonNode directs = hourlyNode.get("direct_radiation");
            JsonNode diffuses = hourlyNode.get("diffuse_radiation");
            JsonNode clouds = hourlyNode.get("cloud_cover");

            int max = Math.min(times.size(), 24);
            for (int i = 0; i < max; i++) {
                String timeStr = times.get(i).asText();
                String hourLabel = timeStr.contains("T") ? timeStr.substring(timeStr.indexOf("T") + 1) : timeStr;
                double dir = directs != null && directs.size() > i ? directs.get(i).asDouble() : 0.0;
                double dif = diffuses != null && diffuses.size() > i ? diffuses.get(i).asDouble() : 0.0;
                double ghi = Math.max(0.0, dir + dif);
                double cld = clouds != null && clouds.size() > i ? clouds.get(i).asDouble() : 0.0;
                double pKw = Math.round(effectiveCapacity * (ghi / 1000.0) * performanceRatio * 100.0) / 100.0;

                hourlyList.add(new SolarForecastResponse.HourlySolarData(hourLabel, Math.round(ghi * 10.0) / 10.0, pKw, cld));
            }
        } else {
            // Analytical 24-hr distribution
            for (int h = 0; h < 24; h++) {
                double rad = 0.0;
                if (h >= 6 && h <= 18) {
                    rad = Math.sin((h - 6) / 12.0 * Math.PI) * 850.0;
                }
                double pKw = Math.round(effectiveCapacity * (rad / 1000.0) * performanceRatio * 100.0) / 100.0;
                hourlyList.add(new SolarForecastResponse.HourlySolarData(String.format("%02d:00", h), Math.round(rad * 10.0) / 10.0, pKw, 15.0));
            }
        }
        resp.setHourlyForecast(hourlyList);

        // Smart Solar-Aware EV Charging Recommendation
        SolarForecastResponse.SolarRecommendation rec = new SolarForecastResponse.SolarRecommendation();
        rec.setOptimalWindowStart("11:00 AM");
        rec.setOptimalWindowEnd("03:30 PM");
        rec.setAvailableSolarKwh(Math.round(todayKwh * 0.72 * 10.0) / 10.0);
        rec.setSolarSharePercentage(78.5);
        rec.setGridSharePercentage(21.5);
        rec.setEstimatedSavings(Math.round(rec.getAvailableSolarKwh() * 8.5 * 10.0) / 10.0); // Cost saved vs peak grid tariff
        rec.setEstimatedCo2SavedKg(Math.round(rec.getAvailableSolarKwh() * 0.82 * 10.0) / 10.0);
        rec.setAdvice("Schedule vehicle charging between 11:00 AM and 03:30 PM for peak solar irradiance window. Over 78% of your charge will be 100% green solar energy!");
        resp.setRecommendation(rec);

        return resp;
    }
}
