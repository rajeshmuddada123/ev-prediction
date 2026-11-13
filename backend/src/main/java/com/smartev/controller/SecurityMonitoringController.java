package com.smartev.controller;

import com.smartev.service.SecurityMonitoringService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/security")
@CrossOrigin(origins = "*")
public class SecurityMonitoringController {

    private final SecurityMonitoringService securityService;

    public SecurityMonitoringController(SecurityMonitoringService securityService) {
        this.securityService = securityService;
    }

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getOverview() {
        return ResponseEntity.ok(securityService.getSecurityOverview());
    }

    @PostMapping("/simulate-probe")
    public ResponseEntity<?> simulateProbe(@RequestBody Map<String, String> payload) {
        String type = payload.getOrDefault("type", "SQLI_PROBE");
        String testPayload = payload.getOrDefault("payload", "' OR '1'='1");
        String ip = payload.getOrDefault("ip", "203.0.113.42");

        boolean allowed = securityService.inspectRequest(ip, "/api/stations", "GET", testPayload);
        return ResponseEntity.ok(Map.of(
            "inspected", true,
            "blocked", !allowed,
            "message", !allowed ? "Threat detected and filtered by proactive WAF inspection." : "Payload passed heuristics."
        ));
    }
}
