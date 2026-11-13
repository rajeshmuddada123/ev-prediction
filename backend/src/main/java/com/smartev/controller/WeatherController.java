package com.smartev.controller;

import com.smartev.dto.WeatherResponse;
import com.smartev.service.WeatherService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/weather")
@CrossOrigin(origins = "*")
public class WeatherController {

    private final WeatherService weatherService;

    public WeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    @GetMapping
    public ResponseEntity<WeatherResponse> getWeather(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon) {

        return ResponseEntity.ok(weatherService.getWeatherData(lat, lon));
    }
}
