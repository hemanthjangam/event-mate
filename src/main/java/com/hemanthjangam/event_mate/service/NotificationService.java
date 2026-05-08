package com.hemanthjangam.event_mate.service;

import com.hemanthjangam.event_mate.entity.Notification;
import com.hemanthjangam.event_mate.entity.User;
import com.hemanthjangam.event_mate.exception.BadRequestException;
import com.hemanthjangam.event_mate.exception.ResourceNotFoundException;
import com.hemanthjangam.event_mate.repository.NotificationRepository;
import com.hemanthjangam.event_mate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
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

    /**
     * Persists a notification and mirrors it to email for the target user.
     */
    public void sendNotification(User user, String message) {
        log.info("Sending notification to {}: {}", user.getEmail(), message);
        emailService.sendEmail(user.getEmail(), "New Notification from Event Mate", message);

        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .read(false)
                .sentAt(LocalDateTime.now())
                .build();

        notificationRepository.save(java.util.Objects.requireNonNull(notification));
    }

    /**
     * Returns unread notifications for the authenticated user.
     */
    public List<Notification> getUserNotifications() {
        return notificationRepository.findByUserIdAndReadFalse(getCurrentUser().getId());
    }

    /**
     * Marks a notification as read after verifying it belongs to the current user.
     */
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(java.util.Objects.requireNonNull(notificationId))
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!notification.getUser().getId().equals(getCurrentUser().getId())) {
            throw new BadRequestException("You are not allowed to update this notification.");
        }
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    /**
     * Resolves the current authenticated user once for notification operations.
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new BadRequestException("Authentication is required.");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + authentication.getName()));
    }
}
