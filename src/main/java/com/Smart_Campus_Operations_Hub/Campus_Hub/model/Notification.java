package com.Smart_Campus_Operations_Hub.Campus_Hub.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;
    
    private String recipientId;
    
    private String message;
    
    private NotificationType type;
    
    private boolean isRead;
    
    private LocalDateTime createdAt;
    
    public enum NotificationType {
        BOOKING_CREATED,
        BOOKING_CANCELLED,
        BOOKING_APPROVED,
        BOOKING_REJECTED,
        TICKET_STATUS_CHANGED,
        NEW_COMMENT,
        SYSTEM_ALERT
    }
}
