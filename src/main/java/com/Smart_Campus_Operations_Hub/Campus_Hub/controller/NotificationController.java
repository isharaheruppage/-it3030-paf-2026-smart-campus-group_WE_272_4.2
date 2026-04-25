package com.Smart_Campus_Operations_Hub.Campus_Hub.controller;

import com.Smart_Campus_Operations_Hub.Campus_Hub.model.Notification;
import com.Smart_Campus_Operations_Hub.Campus_Hub.security.CustomUserDetails;
import com.Smart_Campus_Operations_Hub.Campus_Hub.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<Notification>> getMyNotifications(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(notificationService.getUserNotifications(userDetails.getId()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@AuthenticationPrincipal CustomUserDetails userDetails) {
        long count = notificationService.getUnreadCount(userDetails.getId());
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable String id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@AuthenticationPrincipal CustomUserDetails userDetails) {
        notificationService.markAllAsRead(userDetails.getId());
        return ResponseEntity.ok().build();
    }
}
