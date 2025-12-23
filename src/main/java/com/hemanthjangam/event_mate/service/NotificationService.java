package com.hemanthjangam.event_mate.service;

import com.hemanthjangam.event_mate.entity.Notification;
import com.hemanthjangam.event_mate.entity.User;
import com.hemanthjangam.event_mate.repository.NotificationRepository;
import com.hemanthjangam.event_mate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public void sendNotification(User user, String message) {
        log.info("Sending notification to {}: {}", user.getEmail(), message);

        // Send Email
        emailService.sendEmail(user.getEmail(), "New Notification from Event Mate", message);

        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .read(false)
                .sentAt(LocalDateTime.now())
                .build();

        notificationRepository.save(java.util.Objects.requireNonNull(notification));
    }

    public List<Notification> getUserNotifications() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return notificationRepository.findByUserIdAndReadFalse(user.getId());
    }

    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(java.util.Objects.requireNonNull(notificationId))
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        notificationRepository.save(notification);
    }
}
