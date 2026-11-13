package com.smartev.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "security_events")
public class SecurityEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String eventType; // RATE_LIMIT_EXCEEDED, SUSPICIOUS_PAYLOAD, RAPID_BOOKINGS, REPEATED_FAILURES

    @Column(nullable = false, length = 50)
    private String clientIp;

    @Column(nullable = false, length = 255)
    private String endpoint;

    @Column(length = 10)
    private String httpMethod;

    @Column(nullable = false, length = 20)
    private String riskLevel; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(columnDefinition = "TEXT")
    private String details;

    private Boolean isBlocked = false;
    private LocalDateTime createdAt = LocalDateTime.now();

    public SecurityEvent() {}

    public SecurityEvent(String eventType, String clientIp, String endpoint, String httpMethod,
                         String riskLevel, String details, Boolean isBlocked) {
        this.eventType = eventType;
        this.clientIp = clientIp;
        this.endpoint = endpoint;
        this.httpMethod = httpMethod;
        this.riskLevel = riskLevel;
        this.details = details;
        this.isBlocked = isBlocked;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getClientIp() { return clientIp; }
    public void setClientIp(String clientIp) { this.clientIp = clientIp; }

    public String getEndpoint() { return endpoint; }
    public void setEndpoint(String endpoint) { this.endpoint = endpoint; }

    public String getHttpMethod() { return httpMethod; }
    public void setHttpMethod(String httpMethod) { this.httpMethod = httpMethod; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public Boolean getIsBlocked() { return isBlocked; }
    public void setIsBlocked(Boolean isBlocked) { this.isBlocked = isBlocked; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
