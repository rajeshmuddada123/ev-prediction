package com.smartev.service;

import com.smartev.model.SecurityEvent;
import com.smartev.repository.SecurityEventRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.regex.Pattern;

@Service
public class SecurityMonitoringService {

    private final SecurityEventRepository securityEventRepository;
    private final NotificationService notificationService;

    // Rate limiter: IP -> sliding request count
    private final Map<String, SlidingWindowRateTracker> ipRateLimiters = new ConcurrentHashMap<>();

    // Suspicious pattern signatures (SQLi, XSS, Path Traversal, Command Injection)
    private static final List<Pattern> ATTACK_SIGNATURES = List.of(
        Pattern.compile("(?i)(\\bunion\\b.*\\bselect\\b|'\\s*or\\s*['\"\\d]=\\s*['\"\\d]|--|/\\*|xp_cmdshell)"),
        Pattern.compile("(?i)(<script|javascript:|onerror\\s*=|onload\\s*=|<iframe)"),
        Pattern.compile("(\\.\\./|\\.\\.\\\\|%2e%2e|/etc/passwd|/windows/win\\.ini)"),
        Pattern.compile("(?i)(;|\\|\\||&&|`|\\$\\(.*\\))")
    );

    public SecurityMonitoringService(SecurityEventRepository securityEventRepository,
                                     NotificationService notificationService) {
        this.securityEventRepository = securityEventRepository;
        this.notificationService = notificationService;
    }

    /**
     * Inspect incoming request for rate-limit breaches or suspicious attack payload patterns
     */
    public boolean inspectRequest(String clientIp, String endpoint, String method, String queryOrBody) {
        if (clientIp == null || clientIp.isBlank()) clientIp = "127.0.0.1";

        // 1. Sliding window rate limiting check (Max 120 requests per minute)
        SlidingWindowRateTracker tracker = ipRateLimiters.computeIfAbsent(clientIp, k -> new SlidingWindowRateTracker());
        if (!tracker.allowRequest(120, 60)) {
            logSecurityEvent("RATE_LIMIT_EXCEEDED", clientIp, endpoint, method, "HIGH",
                    "Client exceeded 120 req/min rate limit threshold. Request temporarily throttled.", true);
            return false;
        }

        // 2. Suspicious payload inspection
        if (queryOrBody != null && !queryOrBody.isBlank()) {
            for (Pattern pattern : ATTACK_SIGNATURES) {
                if (pattern.matcher(queryOrBody).find()) {
                    logSecurityEvent("INJECTION_ATTEMPT_BLOCKED", clientIp, endpoint, method, "CRITICAL",
                            "Detected malicious injection signature matching: " + pattern.pattern() + " in payload.", true);
                    return false;
                }
            }
        }

        return true;
    }

    public void logSecurityEvent(String type, String ip, String endpoint, String method, String risk, String details, boolean blocked) {
        SecurityEvent event = new SecurityEvent(type, ip, endpoint, method, risk, details, blocked);
        securityEventRepository.save(event);

        if ("CRITICAL".equalsIgnoreCase(risk) || "HIGH".equalsIgnoreCase(risk)) {
            notificationService.createNotification(
                    "SYSTEM_ALL",
                    "Security Threat Intercepted (" + type + ")",
                    "Shielded suspicious request to " + endpoint + " from IP " + ip + ". Risk: " + risk,
                    "SECURITY",
                    "DANGER"
            );
        }
    }

    public Map<String, Object> getSecurityOverview() {
        Map<String, Object> map = new LinkedHashMap<>();
        List<SecurityEvent> recent = securityEventRepository.findTop50ByOrderByCreatedAtDesc();
        long blockedCount = securityEventRepository.countByIsBlockedTrue();
        long criticalCount = securityEventRepository.countByRiskLevel("CRITICAL");
        long highCount = securityEventRepository.countByRiskLevel("HIGH");

        String status = "NORMAL";
        if (criticalCount > 0) status = "HIGH_ALERT";
        else if (highCount > 2) status = "ELEVATED";

        map.put("systemStatus", status);
        map.put("totalMonitoredEvents", securityEventRepository.count());
        map.put("totalThreatsBlocked", blockedCount);
        map.put("criticalThreats", criticalCount);
        map.put("highThreats", highCount);
        map.put("activeIpTrackers", ipRateLimiters.size());
        map.put("recentEvents", recent);
        map.put("activeDefenses", List.of(
            "Sliding Window Token Bucket Rate Limiting (120 req/min)",
            "SQL Injection & Deep Regex Sanitization Layer",
            "Cross-Site Scripting (XSS) Behavioral Filter",
            "Path Traversal & Command Injection Heuristics",
            "Transactional Concurrency Lock on Slot Reservations"
        ));

        return map;
    }

    // Helper sliding window rate tracker
    private static class SlidingWindowRateTracker {
        private final LinkedList<Long> timestamps = new LinkedList<>();

        public synchronized boolean allowRequest(int maxRequests, int windowSeconds) {
            long now = System.currentTimeMillis();
            long cutoff = now - (windowSeconds * 1000L);

            while (!timestamps.isEmpty() && timestamps.peekFirst() < cutoff) {
                timestamps.pollFirst();
            }

            if (timestamps.size() < maxRequests) {
                timestamps.addLast(now);
                return true;
            }
            return false;
        }
    }
}
