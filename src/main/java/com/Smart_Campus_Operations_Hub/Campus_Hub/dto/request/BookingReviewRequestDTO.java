package com.Smart_Campus_Operations_Hub.Campus_Hub.dto.request;

import com.Smart_Campus_Operations_Hub.Campus_Hub.model.Booking.BookingStatus;

import jakarta.validation.constraints.NotNull;
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
public class BookingReviewRequestDTO {

    @NotNull(message = "Admin ID is required")
    private String adminId;

    @NotNull(message = "Status is required")
    private BookingStatus status;

    private String reason;
}
