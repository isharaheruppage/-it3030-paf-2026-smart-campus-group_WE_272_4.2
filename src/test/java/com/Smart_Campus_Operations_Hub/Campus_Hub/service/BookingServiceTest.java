package com.Smart_Campus_Operations_Hub.Campus_Hub.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.Smart_Campus_Operations_Hub.Campus_Hub.dto.request.BookingRequestDTO;
import com.Smart_Campus_Operations_Hub.Campus_Hub.dto.request.BookingReviewRequestDTO;
import com.Smart_Campus_Operations_Hub.Campus_Hub.dto.response.BookingAnalyticsDTO;
import com.Smart_Campus_Operations_Hub.Campus_Hub.dto.response.BookingResponseDTO;
import com.Smart_Campus_Operations_Hub.Campus_Hub.exception.ConflictException;
import com.Smart_Campus_Operations_Hub.Campus_Hub.model.Booking.BookingStatus;
import com.Smart_Campus_Operations_Hub.Campus_Hub.model.Role;
import com.Smart_Campus_Operations_Hub.Campus_Hub.model.Resource;
import com.Smart_Campus_Operations_Hub.Campus_Hub.model.User;
import com.Smart_Campus_Operations_Hub.Campus_Hub.repository.BookingRepository;
import com.Smart_Campus_Operations_Hub.Campus_Hub.repository.BookingResourceRepository;
import com.Smart_Campus_Operations_Hub.Campus_Hub.repository.UserRepository;

@SpringBootTest
class BookingServiceTest {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
        private BookingResourceRepository resourceRepository;

    private String adminId;
    private String requesterId;
    private String firstResourceId;
    private String secondResourceId;

    @BeforeEach
    void setUp() {
        bookingRepository.deleteAll();

        adminId = ensureUser("Admin User", "admin@smartcampus.local", Role.ADMIN)
                .getId();
        requesterId = ensureUser("Student User", "student@smartcampus.local", Role.USER)
                .getId();
        firstResourceId = ensureResource("Lab 3A", Resource.ResourceType.LAB, 40, "Engineering Building - Floor 3")
                .getId();
        secondResourceId = ensureResource("Conference Room B", Resource.ResourceType.MEETING_ROOM, 12, "Administration Block")
                .getId();
    }

    private User ensureUser(String name, String email, Role role) {
        return userRepository.findByEmail(email)
                .orElseGet(() -> userRepository.save(User.builder()
                        .name(name)
                        .email(email)
                        .roles(Set.of(role))
                        .build()));
    }

    private Resource ensureResource(String name, Resource.ResourceType type, Integer capacity, String location) {
        return resourceRepository.findAll().stream()
                .filter(resource -> name.equals(resource.getName()))
                .findFirst()
                .orElseGet(() -> resourceRepository.save(Resource.builder()
                        .name(name)
                        .type(type)
                        .capacity(capacity)
                        .location(location)
                        .availableFrom(LocalTime.of(8, 0))
                        .availableTo(LocalTime.of(18, 0))
                        .status(Resource.ResourceStatus.ACTIVE)
                        .build()));
    }

    @Test
    void shouldCreatePendingBooking() {
        BookingRequestDTO request = BookingRequestDTO.builder()
                .resourceId(firstResourceId)
                .requesterId(requesterId)
                .bookingDate(LocalDate.now().plusDays(1))
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(11, 0))
                .purpose("Database revision session")
                .expectedAttendees(20)
                .build();

        BookingResponseDTO response = bookingService.createBooking(request);

        assertEquals(BookingStatus.PENDING, response.getStatus());
        assertEquals(firstResourceId, response.getResourceId());
        assertEquals(requesterId, response.getRequesterId());
    }

    @Test
    void shouldRejectApprovalWhenApprovedBookingConflicts() {
        BookingRequestDTO approvedRequest = BookingRequestDTO.builder()
                .resourceId(firstResourceId)
                .requesterId(requesterId)
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
                        .adminId(adminId)
                        .status(BookingStatus.APPROVED)
                        .reason("Looks good")
                        .build());

        BookingRequestDTO conflictingRequest = BookingRequestDTO.builder()
                .resourceId(firstResourceId)
                .requesterId(requesterId)
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
        BookingResponseDTO createdBooking = bookingService.createBooking(BookingRequestDTO.builder()
                .resourceId(secondResourceId)
                .requesterId(requesterId)
                .bookingDate(LocalDate.now().plusDays(3))
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(10, 0))
                .purpose("Admin analytics sample")
                .expectedAttendees(8)
                .build());

        bookingService.reviewBooking(
                createdBooking.getId(),
                BookingReviewRequestDTO.builder()
                        .adminId(adminId)
                        .status(BookingStatus.APPROVED)
                        .reason("Approved for analytics")
                        .build());

        BookingAnalyticsDTO analytics = bookingService.getAdminBookingAnalytics(adminId);

        assertTrue(analytics.getTotalBookings() >= 1);
        assertTrue(analytics.getApprovedBookings() >= 1);
        assertTrue(analytics.getUpcomingApprovedBookings() >= 1);
        assertTrue(analytics.getTopResources().stream()
                .anyMatch(resource -> resource.getResourceId().equals(secondResourceId)));
    }
}
