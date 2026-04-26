package com.Smart_Campus_Operations_Hub.Campus_Hub.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.Smart_Campus_Operations_Hub.Campus_Hub.model.Booking.BookingStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponseDTO {

    private String id;
    private String resourceId;
    private String resourceName;
    private String resourceType;
    private String resourceLocation;
    private String requesterId;
    private String requesterName;
    private String requesterEmail;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String purpose;
    private Integer expectedAttendees;
    private BookingStatus status;
    private String adminReason;
    private String cancellationReason;
    private String reviewedById;
    private String reviewedByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
