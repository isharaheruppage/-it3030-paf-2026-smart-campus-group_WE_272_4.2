package com.Smart_Campus_Operations_Hub.Campus_Hub.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "bookings")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    private String id;

    @DBRef
    private Resource resource;

    @DBRef
    private User requester;

    private LocalDate bookingDate;

    private LocalTime startTime;

    private LocalTime endTime;

    private String purpose;

    private Integer expectedAttendees;

    private BookingStatus status;

    private String adminReason;

    @DBRef
    private User reviewedBy;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public void ensureTimestampsForCreate() {
        if (createdAt == null || updatedAt == null) {
            LocalDateTime now = LocalDateTime.now();
            createdAt = now;
            updatedAt = now;
        }
    }

    public void touchUpdatedAt() {
        updatedAt = LocalDateTime.now();
    }

    public enum BookingStatus {
        PENDING,
        APPROVED,
        REJECTED,
        CANCELLED
    }
}
