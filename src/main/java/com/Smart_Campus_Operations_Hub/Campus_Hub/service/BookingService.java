package com.Smart_Campus_Operations_Hub.Campus_Hub.service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Smart_Campus_Operations_Hub.Campus_Hub.dto.request.BookingRequestDTO;
import com.Smart_Campus_Operations_Hub.Campus_Hub.dto.request.BookingReviewRequestDTO;
import com.Smart_Campus_Operations_Hub.Campus_Hub.dto.response.BookingAnalyticsDTO;
import com.Smart_Campus_Operations_Hub.Campus_Hub.dto.response.BookingResponseDTO;
import com.Smart_Campus_Operations_Hub.Campus_Hub.dto.response.ResourceBookingStatDTO;
import com.Smart_Campus_Operations_Hub.Campus_Hub.exception.BadRequestException;
import com.Smart_Campus_Operations_Hub.Campus_Hub.exception.ConflictException;
import com.Smart_Campus_Operations_Hub.Campus_Hub.exception.ResourceNotFoundException;
import com.Smart_Campus_Operations_Hub.Campus_Hub.model.Booking;
import com.Smart_Campus_Operations_Hub.Campus_Hub.model.Booking.BookingStatus;
import com.Smart_Campus_Operations_Hub.Campus_Hub.model.Role;
import com.Smart_Campus_Operations_Hub.Campus_Hub.model.Resource;
import com.Smart_Campus_Operations_Hub.Campus_Hub.model.User;
import com.Smart_Campus_Operations_Hub.Campus_Hub.repository.BookingRepository;
import com.Smart_Campus_Operations_Hub.Campus_Hub.repository.ResourceRepository;
import com.Smart_Campus_Operations_Hub.Campus_Hub.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class BookingService {

    private static final EnumSet<BookingStatus> CONFLICT_STATUSES =
            EnumSet.of(BookingStatus.PENDING, BookingStatus.APPROVED);

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;

    public BookingResponseDTO createBooking(BookingRequestDTO request) {
        Resource resource = getResourceOrThrow(request.getResourceId());
        User requester = getUserOrThrow(request.getRequesterId());

        validateBookingWindow(request.getStartTime(), request.getEndTime());
        validateRequesterRole(requester);
        validateResourceAvailability(resource, request.getExpectedAttendees());
        ensureNoConflict(
                resource.getId(),
                request.getBookingDate(),
                request.getStartTime(),
                request.getEndTime(),
                null);

        Booking booking = Booking.builder()
                .resource(resource)
                .requester(requester)
                .bookingDate(request.getBookingDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose().trim())
                .expectedAttendees(request.getExpectedAttendees())
                .status(BookingStatus.PENDING)
                .build();
        booking.ensureTimestampsForCreate();

        return toResponse(bookingRepository.save(booking));
    }

    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getAllBookings(
            BookingStatus status,
            String resourceId,
            String requesterId,
            LocalDate bookingDate) {
        return bookingRepository.findAll()
                .stream()
                .filter(booking -> status == null || booking.getStatus() == status)
                .filter(booking -> resourceId == null || booking.getResource().getId().equals(resourceId))
                .filter(booking -> requesterId == null || booking.getRequester().getId().equals(requesterId))
                .filter(booking -> bookingDate == null || bookingDate.equals(booking.getBookingDate()))
                .sorted(Comparator.comparing(Booking::getBookingDate).reversed()
                        .thenComparing(Booking::getStartTime).reversed())
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public BookingResponseDTO getBookingById(String bookingId) {
        return toResponse(getBookingOrThrow(bookingId));
    }

    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getBookingsByRequester(String requesterId) {
        getUserOrThrow(requesterId);
        return bookingRepository.findByRequesterIdOrderByBookingDateDescStartTimeDesc(requesterId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public BookingAnalyticsDTO getAdminBookingAnalytics(String adminId) {
        User admin = getUserOrThrow(adminId);
        validateAdminRole(admin);

        List<Booking> bookings = bookingRepository.findAll();
        LocalDate today = LocalDate.now();

        long totalBookings = bookings.size();
        long pendingBookings = countByStatus(bookings, BookingStatus.PENDING);
        long approvedBookings = countByStatus(bookings, BookingStatus.APPROVED);
        long rejectedBookings = countByStatus(bookings, BookingStatus.REJECTED);
        long cancelledBookings = countByStatus(bookings, BookingStatus.CANCELLED);
        long todaysBookings = bookings.stream()
                .filter(booking -> today.equals(booking.getBookingDate()))
                .count();
        long upcomingApprovedBookings = bookings.stream()
                .filter(booking -> booking.getStatus() == BookingStatus.APPROVED)
                .filter(booking -> !booking.getBookingDate().isBefore(today))
                .count();

        double approvalRate = totalBookings == 0
                ? 0.0
                : (approvedBookings * 100.0) / totalBookings;
        Map<String, Long> approvedBookingsByResource = approvedBookingsByResource(bookings);

        List<ResourceBookingStatDTO> topResources = bookings.stream()
                .collect(Collectors.groupingBy(booking -> booking.getResource().getId()))
                .entrySet()
                .stream()
                .map(entry -> mapToResourceStat(entry, approvedBookingsByResource.get(entry.getKey())))
                .sorted(Comparator.comparingLong(ResourceBookingStatDTO::getTotalBookings)
                        .reversed()
                        .thenComparing(Comparator.comparingLong(ResourceBookingStatDTO::getApprovedBookings)
                                .reversed())
                        .thenComparing(ResourceBookingStatDTO::getResourceName))
                .limit(5)
                .toList();

        return BookingAnalyticsDTO.builder()
                .totalBookings(totalBookings)
                .pendingBookings(pendingBookings)
                .approvedBookings(approvedBookings)
                .rejectedBookings(rejectedBookings)
                .cancelledBookings(cancelledBookings)
                .todaysBookings(todaysBookings)
                .upcomingApprovedBookings(upcomingApprovedBookings)
                .approvalRate(approvalRate)
                .topResources(topResources)
                .build();
    }

    public BookingResponseDTO reviewBooking(String bookingId, BookingReviewRequestDTO request) {
        Booking booking = getBookingOrThrow(bookingId);
        User admin = getUserOrThrow(request.getAdminId());

        validateAdminRole(admin);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only pending bookings can be reviewed");
        }

        if (request.getStatus() != BookingStatus.APPROVED && request.getStatus() != BookingStatus.REJECTED) {
            throw new BadRequestException("Review status must be APPROVED or REJECTED");
        }

        if (request.getStatus() == BookingStatus.REJECTED
                && (request.getReason() == null || request.getReason().trim().isEmpty())) {
            throw new BadRequestException("Reason is required when rejecting a booking");
        }

        if (request.getStatus() == BookingStatus.APPROVED) {
            ensureNoConflict(
                    booking.getResource().getId(),
                    booking.getBookingDate(),
                    booking.getStartTime(),
                    booking.getEndTime(),
                    booking.getId());
        }

        booking.setStatus(request.getStatus());
        booking.setAdminReason(normalizeReason(request.getReason()));
        booking.setReviewedBy(admin);
        booking.touchUpdatedAt();

        return toResponse(bookingRepository.save(booking));
    }

    public BookingResponseDTO cancelBooking(String bookingId, String requesterId) {
        Booking booking = getBookingOrThrow(bookingId);

        if (!booking.getRequester().getId().equals(requesterId)) {
            throw new BadRequestException("Only the requester can cancel this booking");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled");
        }

        if (booking.getStatus() == BookingStatus.REJECTED) {
            throw new BadRequestException("Rejected bookings cannot be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.touchUpdatedAt();
        return toResponse(bookingRepository.save(booking));
    }

    public void deleteBooking(String bookingId) {
        Booking booking = getBookingOrThrow(bookingId);
        bookingRepository.delete(booking);
    }

    private void ensureNoConflict(
            String resourceId,
            LocalDate bookingDate,
            java.time.LocalTime startTime,
            java.time.LocalTime endTime,
            String excludeBookingId) {
        boolean hasConflict = bookingRepository
                .findByResourceIdAndBookingDateAndStatusIn(resourceId, bookingDate, List.copyOf(CONFLICT_STATUSES))
                .stream()
                .filter(booking -> excludeBookingId == null || !booking.getId().equals(excludeBookingId))
                .anyMatch(booking -> booking.getStartTime().isBefore(endTime) && booking.getEndTime().isAfter(startTime));

        if (hasConflict) {
            throw new ConflictException("The selected resource is already booked for the requested time");
        }
    }

    private void validateBookingWindow(java.time.LocalTime startTime, java.time.LocalTime endTime) {
        if (!startTime.isBefore(endTime)) {
            throw new BadRequestException("Start time must be before end time");
        }
    }

    private void validateRequesterRole(User requester) {
        if (requester.getRole() != Role.USER) {
            throw new BadRequestException("Only users can create bookings");
        }
    }

    private void validateAdminRole(User admin) {
        if (admin.getRole() != Role.ADMIN) {
            throw new BadRequestException("Only admins can review bookings");
        }
    }

    private void validateResourceAvailability(Resource resource, Integer expectedAttendees) {
        if (resource.getStatus() != Resource.ResourceStatus.ACTIVE) {
            throw new BadRequestException("Resource is not available for booking");
        }

        if (expectedAttendees > resource.getCapacity()) {
            throw new BadRequestException("Expected attendees exceed the resource capacity");
        }
    }

    private String normalizeReason(String reason) {
        if (reason == null) {
            return null;
        }

        String trimmedReason = reason.trim();
        return trimmedReason.isEmpty() ? null : trimmedReason;
    }

    private Booking getBookingOrThrow(String bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));
    }

    private Resource getResourceOrThrow(String resourceId) {
        return resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + resourceId));
    }

    private User getUserOrThrow(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    private long countByStatus(List<Booking> bookings, BookingStatus status) {
        return bookings.stream()
                .filter(booking -> booking.getStatus() == status)
                .count();
    }

    private Map<String, Long> approvedBookingsByResource(List<Booking> bookings) {
        return bookings.stream()
                .filter(booking -> booking.getStatus() == BookingStatus.APPROVED)
                .collect(Collectors.groupingBy(
                        booking -> booking.getResource().getId(),
                        Collectors.counting()));
    }

    private ResourceBookingStatDTO mapToResourceStat(Map.Entry<String, List<Booking>> entry, Long approvedBookings) {
        Booking sampleBooking = entry.getValue().get(0);

        return ResourceBookingStatDTO.builder()
                .resourceId(sampleBooking.getResource().getId())
                .resourceName(sampleBooking.getResource().getName())
                .totalBookings(entry.getValue().size())
                .approvedBookings(approvedBookings != null ? approvedBookings : 0L)
                .build();
    }

    private BookingResponseDTO toResponse(Booking booking) {
        User reviewer = booking.getReviewedBy();

        return BookingResponseDTO.builder()
                .id(booking.getId())
                .resourceId(booking.getResource().getId())
                .resourceName(booking.getResource().getName())
                .resourceType(booking.getResource().getType().name())
                .resourceLocation(booking.getResource().getLocation())
                .requesterId(booking.getRequester().getId())
                .requesterName(booking.getRequester().getFullName())
                .requesterEmail(booking.getRequester().getEmail())
                .bookingDate(booking.getBookingDate())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .purpose(booking.getPurpose())
                .expectedAttendees(booking.getExpectedAttendees())
                .status(booking.getStatus())
                .adminReason(booking.getAdminReason())
                .reviewedById(reviewer != null ? reviewer.getId() : null)
                .reviewedByName(reviewer != null ? reviewer.getFullName() : null)
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }
}
