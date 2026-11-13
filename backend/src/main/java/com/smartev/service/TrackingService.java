package com.smartev.service;

import com.smartev.dto.TrackingUpdateRequest;
import com.smartev.model.ChargingStation;
import com.smartev.model.VehicleTrackingPoint;
import com.smartev.repository.ChargingStationRepository;
import com.smartev.repository.VehicleTrackingPointRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TrackingService {

    private final VehicleTrackingPointRepository trackingRepository;
    private final ChargingStationRepository stationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // Cache latest position per device
    private final Map<String, VehicleTrackingPoint> activeTrackingSessions = new ConcurrentHashMap<>();

    public TrackingService(VehicleTrackingPointRepository trackingRepository,
                           ChargingStationRepository stationRepository,
                           SimpMessagingTemplate messagingTemplate) {
        this.trackingRepository = trackingRepository;
        this.stationRepository = stationRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public VehicleTrackingPoint updateLocation(TrackingUpdateRequest req) {
        Double targetLat = 28.6315;
        Double targetLon = 77.2215;

        if (req.getTargetStationId() != null) {
            Optional<ChargingStation> stationOpt = stationRepository.findById(req.getTargetStationId());
            if (stationOpt.isPresent()) {
                targetLat = stationOpt.get().getLatitude();
                targetLon = stationOpt.get().getLongitude();
            }
        }

        double remainingDist = StationService.calculateDistanceKm(
                req.getLatitude(), req.getLongitude(), targetLat, targetLon
        );

        double speed = (req.getSpeedKmh() != null && req.getSpeedKmh() > 0) ? req.getSpeedKmh() : 38.0; // avg city driving speed
        int etaMinutes = (int) Math.max(1, Math.round((remainingDist / speed) * 60.0));

        VehicleTrackingPoint point = new VehicleTrackingPoint(
                req.getDeviceId(),
                req.getTargetStationId(),
                req.getLatitude(),
                req.getLongitude(),
                req.getSpeedKmh() != null ? req.getSpeedKmh() : 0.0,
                req.getHeading() != null ? req.getHeading() : 0.0,
                req.getBatteryPercentage(),
                remainingDist,
                etaMinutes
        );

        VehicleTrackingPoint saved = trackingRepository.save(point);
        activeTrackingSessions.put(req.getDeviceId(), saved);

        // Broadcast to WebSocket topic
        try {
            messagingTemplate.convertAndSend("/topic/tracking/" + req.getDeviceId(), saved);
        } catch (Exception ignored) {}

        return saved;
    }

    public Optional<VehicleTrackingPoint> getLatestLocation(String deviceId) {
        if (activeTrackingSessions.containsKey(deviceId)) {
            return Optional.of(activeTrackingSessions.get(deviceId));
        }
        var history = trackingRepository.findTop20ByDeviceIdOrderByRecordedAtDesc(deviceId);
        return history.isEmpty() ? Optional.empty() : Optional.of(history.get(0));
    }

    public void stopTracking(String deviceId) {
        activeTrackingSessions.remove(deviceId);
        try {
            messagingTemplate.convertAndSend("/topic/tracking/" + deviceId, Map.of("status", "STOPPED"));
        } catch (Exception ignored) {}
    }
}
