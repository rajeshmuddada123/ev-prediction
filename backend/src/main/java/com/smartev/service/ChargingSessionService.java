package com.smartev.service;

import com.smartev.model.ChargingSession;
import com.smartev.model.ChargingStation;
import com.smartev.repository.ChargingSessionRepository;
import com.smartev.repository.ChargingStationRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@EnableScheduling
public class ChargingSessionService {

    private final ChargingSessionRepository sessionRepository;
    private final ChargingStationRepository stationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    // Cache active in-flight charging sessions for smooth live simulation
    private final Map<String, ChargingSession> activeSessions = new ConcurrentHashMap<>();

    public ChargingSessionService(ChargingSessionRepository sessionRepository,
                                  ChargingStationRepository stationRepository,
                                  SimpMessagingTemplate messagingTemplate,
                                  NotificationService notificationService) {
        this.sessionRepository = sessionRepository;
        this.stationRepository = stationRepository;
        this.messagingTemplate = messagingTemplate;
        this.notificationService = notificationService;
    }

    public ChargingSession startSession(String deviceId, Long stationId, Double startSoc, Double targetSoc) {
        // Stop any active existing session for this device
        activeSessions.values().stream()
                .filter(s -> s.getDeviceId().equals(deviceId) && "IN_PROGRESS".equals(s.getStatus()))
                .forEach(s -> stopSession(s.getSessionId()));

        ChargingStation station = stationRepository.findById(stationId != null ? stationId : 1L)
                .orElse(new ChargingStation());

        String sessionId = "CHG-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        double actualStartSoc = startSoc != null ? startSoc : 35.0;
        double actualTargetSoc = targetSoc != null ? targetSoc : 90.0;
        double power = station.getMaxPowerKw() != null ? station.getMaxPowerKw() : 120.0;

        ChargingSession session = new ChargingSession(
                sessionId, deviceId, station.getId(),
                station.getName() != null ? station.getName() : "Tata Power Fast Hub",
                actualStartSoc, actualTargetSoc, power
        );

        ChargingSession saved = sessionRepository.save(session);
        activeSessions.put(sessionId, saved);

        notificationService.createNotification(
                deviceId,
                "Charging Session Started: " + sessionId,
                "Vehicle charging initialized at " + session.getStationName() + " (" + power + " kW DC Fast Charger).",
                "CHARGING",
                "INFO"
        );

        return saved;
    }

    public ChargingSession stopSession(String sessionId) {
        ChargingSession session = activeSessions.get(sessionId);
        if (session == null) {
            session = sessionRepository.findBySessionId(sessionId).orElse(null);
        }
        if (session == null) {
            throw new IllegalArgumentException("Session not found: " + sessionId);
        }

        session.setStatus("STOPPED");
        session.setEndedAt(LocalDateTime.now());
        ChargingSession saved = sessionRepository.save(session);
        activeSessions.remove(sessionId);

        try {
            messagingTemplate.convertAndSend("/topic/charging/" + sessionId, saved);
        } catch (Exception ignored) {}

        notificationService.createNotification(
                session.getDeviceId(),
                "Charging Completed: " + sessionId,
                String.format("Delivered %.2f kWh. Final battery SOC: %.1f%%.", session.getEnergyDeliveredKwh(), session.getCurrentSoc()),
                "CHARGING",
                "SUCCESS"
        );

        return saved;
    }

    public Optional<ChargingSession> getSession(String sessionId) {
        if (activeSessions.containsKey(sessionId)) {
            return Optional.of(activeSessions.get(sessionId));
        }
        return sessionRepository.findBySessionId(sessionId);
    }

    public Optional<ChargingSession> getActiveSessionForDevice(String deviceId) {
        for (ChargingSession s : activeSessions.values()) {
            if (s.getDeviceId().equals(deviceId) && "IN_PROGRESS".equals(s.getStatus())) {
                return Optional.of(s);
            }
        }
        return sessionRepository.findFirstByDeviceIdAndStatus(deviceId, "IN_PROGRESS");
    }

    public List<ChargingSession> getDeviceSessionHistory(String deviceId) {
        return sessionRepository.findByDeviceIdOrderByStartedAtDesc(deviceId);
    }

    /**
     * Periodic background tick to simulate live charging progress every 3 seconds for active sessions
     */
    @Scheduled(fixedRate = 3000)
    public void progressActiveChargingSessions() {
        if (activeSessions.isEmpty()) return;

        for (ChargingSession session : activeSessions.values()) {
            if (!"IN_PROGRESS".equals(session.getStatus())) continue;

            session.setDurationSeconds(session.getDurationSeconds() + 3);

            // Energy delivered in 3 seconds = (Power_kW * 3s / 3600s)
            double energyIncrement = (session.getPowerKw() * 3.0) / 3600.0;
            session.setEnergyDeliveredKwh(Math.round((session.getEnergyDeliveredKwh() + energyIncrement) * 100.0) / 100.0);

            // Standard EV battery assumption 50 kWh: delta SOC = (energyIncrement / 50 kWh) * 100
            double socIncrement = (energyIncrement / 50.0) * 100.0;
            double nextSoc = Math.min(100.0, Math.round((session.getCurrentSoc() + socIncrement) * 10.0) / 10.0);
            session.setCurrentSoc(nextSoc);

            if (nextSoc >= session.getTargetSoc()) {
                session.setStatus("COMPLETED");
                session.setEndedAt(LocalDateTime.now());
                sessionRepository.save(session);
                activeSessions.remove(session.getSessionId());

                notificationService.createNotification(
                        session.getDeviceId(),
                        "Target SOC Reached: " + session.getTargetSoc() + "%",
                        "Vehicle has finished charging to target level at " + session.getStationName(),
                        "CHARGING",
                        "SUCCESS"
                );
            } else {
                sessionRepository.save(session);
            }

            // Broadcast tick
            try {
                messagingTemplate.convertAndSend("/topic/charging/" + session.getSessionId(), session);
            } catch (Exception ignored) {}
        }
    }
}
