package com.smartev.controller;

import com.smartev.dto.RangePredictionRequest;
import com.smartev.dto.RangePredictionResponse;
import com.smartev.service.RangePredictionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/range")
@CrossOrigin(origins = "*")
public class RangePredictionController {

    private final RangePredictionService rangePredictionService;

    public RangePredictionController(RangePredictionService rangePredictionService) {
        this.rangePredictionService = rangePredictionService;
    }

    @PostMapping("/predict")
    public ResponseEntity<RangePredictionResponse> predictRange(@RequestBody RangePredictionRequest req) {
        return ResponseEntity.ok(rangePredictionService.predictRange(req));
    }
}
