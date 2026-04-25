package com.Smart_Campus_Operations_Hub.Campus_Hub.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final com.Smart_Campus_Operations_Hub.Campus_Hub.service.NotificationService notificationService;

    public NotificationController(com.Smart_Campus_Operations_Hub.Campus_Hub.service.NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<?> getMyNotifications(Authentication authentication) {
        return ResponseEntity.ok(notificationService.getUserNotifications(getCurrentUserId(authentication)));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication authentication) {
        long count = notificationService.getUnreadCount(getCurrentUserId(authentication));
        return ResponseEntity.ok(Collections.singletonMap("unreadCount", count));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable String id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(Authentication authentication) {
        notificationService.markAllAsRead(getCurrentUserId(authentication));
        return ResponseEntity.ok().build();
    }

    private String getCurrentUserId(Authentication authentication) {
        Object principal = authentication.getPrincipal();

        if (principal instanceof com.Smart_Campus_Operations_Hub.Campus_Hub.security.CustomUserDetails) {
            com.Smart_Campus_Operations_Hub.Campus_Hub.security.CustomUserDetails userDetails =
                    (com.Smart_Campus_Operations_Hub.Campus_Hub.security.CustomUserDetails) principal;
            return userDetails.getId();
        }

        throw new IllegalStateException("Unexpected authenticated principal: " + principal.getClass().getName());
    }
}
