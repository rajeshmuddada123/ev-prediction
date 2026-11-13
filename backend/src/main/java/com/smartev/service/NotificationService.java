package com.smartev.service;

import com.smartev.model.Notification;
import com.smartev.repository.NotificationRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(NotificationRepository notificationRepository,
                               SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public Notification createNotification(String deviceId, String title, String message, String type, String severity) {
        Notification notification = new Notification(deviceId, title, message, type, severity);
        Notification saved = notificationRepository.save(notification);

        // Broadcast to WebSocket topic if connected
        try {
            messagingTemplate.convertAndSend("/topic/notifications/" + deviceId, saved);
            messagingTemplate.convertAndSend("/topic/notifications/broadcast", saved);
        } catch (Exception ignored) {}

        return saved;
    }

    public List<Notification> getNotifications(String deviceId) {
        return notificationRepository.findByDeviceIdOrderByCreatedAtDesc(deviceId);
    }

    public void markAsRead(Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setIsRead(true);
            notificationRepository.save(n);
        });
    }

    public void markAllAsRead(String deviceId) {
        List<Notification> list = notificationRepository.findByDeviceIdAndIsReadFalseOrderByCreatedAtDesc(deviceId);
        for (Notification n : list) {
            n.setIsRead(true);
        }
        notificationRepository.saveAll(list);
    }
}
