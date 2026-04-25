package com.Smart_Campus_Operations_Hub.Campus_Hub.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.time.LocalDate;
import java.time.LocalTime;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.Smart_Campus_Operations_Hub.Campus_Hub.dto.request.BookingRequestDTO;
import com.Smart_Campus_Operations_Hub.Campus_Hub.dto.request.BookingReviewRequestDTO;
import com.Smart_Campus_Operations_Hub.Campus_Hub.dto.response.BookingAnalyticsDTO;
import com.Smart_Campus_Operations_Hub.Campus_Hub.dto.response.BookingResponseDTO;
import com.Smart_Campus_Operations_Hub.Campus_Hub.exception.ConflictException;
import com.Smart_Campus_Operations_Hub.Campus_Hub.model.Booking.BookingStatus;
import com.Smart_Campus_Operations_Hub.Campus_Hub.model.Resource;
import com.Smart_Campus_Operations_Hub.Campus_Hub.model.Role;
import com.Smart_Campus_Operations_Hub.Campus_Hub.model.User;
import com.Smart_Campus_Operations_Hub.Campus_Hub.repository.ResourceRepository;
import com.Smart_Campus_Operations_Hub.Campus_Hub.repository.UserRepository;

@SpringBootTest
class BookingServiceTest {

    @Autowired
    private BookingService bookingService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ResourceRepository resourceRepository;

    private User getAdmin() {
        return userRepository.findAll().stream()
                .filter(user -> user.getRole() == Role.ADMIN)
                .findFirst()
                .orElseThrow();
    }

    private User getRegularUser() {
        return userRepository.findAll().stream()
                .filter(user -> user.getRole() == Role.USER)
                .findFirst()
                .orElseThrow();
    }

    private Resource getAnyResource() {
        return resourceRepository.findAll().stream().findFirst().orElseThrow();
    }

    @Test
    void shouldCreatePendingBooking() {
        User requester = getRegularUser();
        Resource resource = getAnyResource();
        BookingRequestDTO request = BookingRequestDTO.builder()
                .resourceId(resource.getId())
                .requesterId(requester.getId())
                .bookingDate(LocalDate.now().plusDays(1))
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(11, 0))
                .purpose("Database revision session")
                .expectedAttendees(20)
                .build();

        BookingResponseDTO response = bookingService.createBooking(request);

        assertEquals(BookingStatus.PENDING, response.getStatus());
        assertEquals(resource.getId(), response.getResourceId());
        assertEquals(requester.getId(), response.getRequesterId());
    }

    @Test
    void shouldRejectApprovalWhenApprovedBookingConflicts() {
        User admin = getAdmin();
        User requester = getRegularUser();
        Resource resource = getAnyResource();
        BookingRequestDTO approvedRequest = BookingRequestDTO.builder()
                .resourceId(resource.getId())
                .requesterId(requester.getId())
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
                        .adminId(admin.getId())
                        .status(BookingStatus.APPROVED)
                        .reason("Looks good")
                        .build());

        BookingRequestDTO conflictingRequest = BookingRequestDTO.builder()
                .resourceId(resource.getId())
                .requesterId(requester.getId())
                .bookingDate(LocalDate.now().plusDays(2))
                .startTime(LocalTime.of(11, 0))
                .endTime(LocalTime.of(13, 0))
                .purpose("Overlapping booking")
                .expectedAttendees(20)
                .build();

        assertThrows(ConflictException.class, () -> bookingService.createBooking(conflictingRequest));
    }

    @Test
    void shouldReturnAdminBookingAnalytics() {
        User admin = getAdmin();
        User requester = getRegularUser();
        Resource resource = getAnyResource();
        BookingResponseDTO createdBooking = bookingService.createBooking(BookingRequestDTO.builder()
                .resourceId(resource.getId())
                .requesterId(requester.getId())
                .bookingDate(LocalDate.now().plusDays(3))
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(10, 0))
                .purpose("Admin analytics sample")
                .expectedAttendees(8)
                .build());

        bookingService.reviewBooking(
                createdBooking.getId(),
                BookingReviewRequestDTO.builder()
                        .adminId(admin.getId())
                        .status(BookingStatus.APPROVED)
                        .reason("Approved for analytics")
                        .build());

        BookingAnalyticsDTO analytics = bookingService.getAdminBookingAnalytics(admin.getId());

        assertTrue(analytics.getTotalBookings() >= 1);
        assertTrue(analytics.getApprovedBookings() >= 1);
        assertTrue(analytics.getUpcomingApprovedBookings() >= 1);
        assertTrue(analytics.getTopResources().stream()
                .anyMatch(resourceStat -> resourceStat.getResourceId().equals(resource.getId())));
    }
}
