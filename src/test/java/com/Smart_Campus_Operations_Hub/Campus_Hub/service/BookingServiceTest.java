package com.Smart_Campus_Operations_Hub.Campus_Hub.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.time.LocalDate;
import java.time.LocalTime;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.Smart_Campus_Operations_Hub.Campus_Hub.dto.request.BookingRequestDTO;
import com.Smart_Campus_Operations_Hub.Campus_Hub.dto.request.BookingReviewRequestDTO;
import com.Smart_Campus_Operations_Hub.Campus_Hub.dto.response.BookingResponseDTO;
import com.Smart_Campus_Operations_Hub.Campus_Hub.exception.ConflictException;
import com.Smart_Campus_Operations_Hub.Campus_Hub.model.Booking.BookingStatus;

@SpringBootTest
class BookingServiceTest {

    @Autowired
    private BookingService bookingService;

    @Test
    void shouldCreatePendingBooking() {
        BookingRequestDTO request = BookingRequestDTO.builder()
                .resourceId(1L)
                .requesterId(2L)
                .bookingDate(LocalDate.now().plusDays(1))
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(11, 0))
                .purpose("Database revision session")
                .expectedAttendees(20)
                .build();

        BookingResponseDTO response = bookingService.createBooking(request);

        assertEquals(BookingStatus.PENDING, response.getStatus());
        assertEquals(1L, response.getResourceId());
        assertEquals(2L, response.getRequesterId());
    }

    @Test
    void shouldRejectApprovalWhenApprovedBookingConflicts() {
        BookingRequestDTO approvedRequest = BookingRequestDTO.builder()
                .resourceId(1L)
                .requesterId(2L)
                .bookingDate(LocalDate.now().plusDays(2))
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(12, 0))
                .purpose("Approved lab session")
                .expectedAttendees(25)
                .build();

        BookingResponseDTO approvedBooking = bookingService.createBooking(approvedRequest);
        bookingService.reviewBooking(
                approvedBooking.getId(),
                BookingReviewRequestDTO.builder()
                        .adminId(1L)
                        .status(BookingStatus.APPROVED)
                        .reason("Looks good")
                        .build());

        BookingRequestDTO conflictingRequest = BookingRequestDTO.builder()
                .resourceId(1L)
                .requesterId(2L)
                .bookingDate(LocalDate.now().plusDays(2))
                .startTime(LocalTime.of(11, 0))
                .endTime(LocalTime.of(13, 0))
                .purpose("Overlapping booking")
                .expectedAttendees(20)
                .build();

        assertThrows(ConflictException.class, () -> bookingService.createBooking(conflictingRequest));
    }
}
