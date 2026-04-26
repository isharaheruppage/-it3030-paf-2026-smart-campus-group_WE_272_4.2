package com.Smart_Campus_Operations_Hub.Campus_Hub.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.Map.Entry;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

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
import com.Smart_Campus_Operations_Hub.Campus_Hub.model.Resource;
import com.Smart_Campus_Operations_Hub.Campus_Hub.model.User;
import com.Smart_Campus_Operations_Hub.Campus_Hub.model.Role;
import com.Smart_Campus_Operations_Hub.Campus_Hub.model.Notification;
import com.Smart_Campus_Operations_Hub.Campus_Hub.service.NotificationService;
import com.Smart_Campus_Operations_Hub.Campus_Hub.repository.BookingRepository;
import com.Smart_Campus_Operations_Hub.Campus_Hub.repository.BookingResourceRepository;
import com.Smart_Campus_Operations_Hub.Campus_Hub.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookingService {

        private static final EnumSet<BookingStatus> CONFLICT_STATUSES =
            EnumSet.of(BookingStatus.APPROVED);

    private final BookingRepository bookingRepository;
        private final BookingResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

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
            .resourceId(resource.getId())
            .requesterId(requester.getId())
                .bookingDate(request.getBookingDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose().trim())
                .expectedAttendees(request.getExpectedAttendees())
                .status(BookingStatus.PENDING)
            .createdAt(java.time.Instant.now())
            .updatedAt(java.time.Instant.now())
                .build();

        Booking saved = bookingRepository.save(booking);

        // notify admins about new booking
        String actor = requester.getName() != null ? requester.getName() : requester.getEmail();
        String createdMsg = String.format("New booking by %s for %s on %s %s-%s",
            actor,
            resource.getName(),
            saved.getBookingDate(),
            saved.getStartTime(),
            saved.getEndTime());

        userRepository.findAll().stream()
            .filter(u -> u.getRoles() != null && u.getRoles().contains(Role.ADMIN))
            .forEach(admin -> notificationService.createNotification(admin.getId(), createdMsg, Notification.NotificationType.BOOKING_CREATED));

        return toResponse(saved);
    }

    public BookingResponseDTO updateBooking(String bookingId, BookingRequestDTO request) {
        Booking booking = getBookingOrThrow(bookingId);
        User requester = getUserOrThrow(request.getRequesterId());

        if (!Objects.equals(booking.getRequesterId(), requester.getId())) {
            throw new BadRequestException("Only the requester can edit this booking");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only pending bookings can be edited");
        }

        Resource resource = getResourceOrThrow(request.getResourceId());

        validateBookingWindow(request.getStartTime(), request.getEndTime());
        validateRequesterRole(requester);
        validateResourceAvailability(resource, request.getExpectedAttendees());
        ensureNoConflict(
                resource.getId(),
                request.getBookingDate(),
                request.getStartTime(),
                request.getEndTime(),
                booking.getId());

        booking.setResourceId(resource.getId());
        booking.setRequesterId(requester.getId());
        booking.setBookingDate(request.getBookingDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose().trim());
        booking.setExpectedAttendees(request.getExpectedAttendees());
        booking.setStatus(BookingStatus.PENDING);
        booking.setAdminReason(null);
        booking.setCancellationReason(null);
        booking.setReviewedById(null);
        booking.setUpdatedAt(java.time.Instant.now());

        return toResponse(bookingRepository.save(booking));
    }

    public List<BookingResponseDTO> getAllBookings(
            BookingStatus status,
            String resourceId,
            String requesterId,
            LocalDate bookingDate) {
        String resolvedRequesterId = requesterId != null ? getUserOrThrow(requesterId).getId() : null;

        return bookingRepository.findAll().stream()
            .filter(booking -> status == null || booking.getStatus() == status)
            .filter(booking -> resourceId == null || Objects.equals(booking.getResourceId(), resourceId))
            .filter(booking -> resolvedRequesterId == null || Objects.equals(booking.getRequesterId(), resolvedRequesterId))
            .filter(booking -> bookingDate == null || Objects.equals(booking.getBookingDate(), bookingDate))
            .sorted(Comparator.comparing(Booking::getBookingDate, Comparator.reverseOrder())
                .thenComparing(Booking::getStartTime, Comparator.reverseOrder()))
                .map(this::toResponse)
                .toList();
    }

        public BookingResponseDTO getBookingById(String bookingId) {
        return toResponse(getBookingOrThrow(bookingId));
    }

        public List<BookingResponseDTO> getBookingsByRequester(String requesterId) {
        String resolvedRequesterId = getUserOrThrow(requesterId).getId();

        return bookingRepository.findAll().stream()
            .filter(booking -> Objects.equals(booking.getRequesterId(), resolvedRequesterId))
            .sorted(Comparator.comparing(Booking::getBookingDate, Comparator.reverseOrder())
                .thenComparing(Booking::getStartTime, Comparator.reverseOrder()))
                .map(this::toResponse)
                .toList();
    }

        public BookingAnalyticsDTO getAdminBookingAnalytics(String adminId) {
        User admin = getUserOrThrow(adminId);
        validateAdminRole(admin);

        List<Booking> bookings = bookingRepository.findAll();
        Map<String, Resource> resourcesById = resourceRepository.findAll().stream()
            .collect(Collectors.toMap(Resource::getId, resource -> resource));
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
            .collect(Collectors.groupingBy(Booking::getResourceId))
                .entrySet()
                .stream()
            .map(entry -> mapToResourceStat(entry, approvedBookingsByResource.get(entry.getKey()), resourcesById))
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
                    booking.getResourceId(),
                    booking.getBookingDate(),
                    booking.getStartTime(),
                    booking.getEndTime(),
                    booking.getId());
        }

        booking.setStatus(request.getStatus());
        booking.setAdminReason(normalizeReason(request.getReason()));
        booking.setCancellationReason(null);
        booking.setReviewedById(admin.getId());
        booking.setUpdatedAt(java.time.Instant.now());

        Booking saved = bookingRepository.save(booking);

        // notify requester about approval/rejection
        Resource resource = getResourceOrThrow(booking.getResourceId());
        String adminName = admin.getName() != null ? admin.getName() : admin.getEmail();
        String requesterId = booking.getRequesterId();

        if (request.getStatus() == Booking.BookingStatus.APPROVED) {
            String msg = String.format("Your booking for %s on %s %s-%s has been approved by %s",
                    resource.getName(),
                    saved.getBookingDate(),
                    saved.getStartTime(),
                    saved.getEndTime(),
                    adminName);
            notificationService.createNotification(requesterId, msg, Notification.NotificationType.BOOKING_APPROVED);
        } else if (request.getStatus() == Booking.BookingStatus.REJECTED) {
            String reason = saved.getAdminReason() != null ? saved.getAdminReason() : "";
            String msg = String.format("Your booking for %s on %s %s-%s has been rejected by %s. Reason: %s",
                    resource.getName(),
                    saved.getBookingDate(),
                    saved.getStartTime(),
                    saved.getEndTime(),
                    adminName,
                    reason);
            notificationService.createNotification(requesterId, msg, Notification.NotificationType.BOOKING_REJECTED);
        }

        return toResponse(saved);
    }

    public BookingResponseDTO cancelBooking(String bookingId, String requesterId, String reason) {
        Booking booking = getBookingOrThrow(bookingId);
        User requester = getUserOrThrow(requesterId);
        String resolvedRequesterId = requester.getId();

        if (!Objects.equals(booking.getRequesterId(), resolvedRequesterId)) {
            throw new BadRequestException("Only the requester can cancel this booking");
        }

        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new BadRequestException("Only approved bookings can be cancelled");
        }

        String normalizedReason = normalizeReason(reason);

        if (normalizedReason == null) {
            throw new BadRequestException("Reason is required when cancelling a booking");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled");
        }

        if (booking.getStatus() == BookingStatus.REJECTED) {
            throw new BadRequestException("Rejected bookings cannot be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationReason(normalizedReason);
        booking.setAdminReason(null);
        booking.setUpdatedAt(java.time.Instant.now());

        Booking saved = bookingRepository.save(booking);

        // notify admins about cancellation
        Resource resource = getResourceOrThrow(saved.getResourceId());
        String actor = requester.getName() != null ? requester.getName() : requester.getEmail();
        String cancelMsg = String.format("Booking cancelled by %s for %s on %s %s-%s. Reason: %s",
            actor,
            resource.getName(),
            saved.getBookingDate(),
            saved.getStartTime(),
            saved.getEndTime(),
            normalizedReason != null ? normalizedReason : "");

        userRepository.findAll().stream()
            .filter(u -> u.getRoles() != null && u.getRoles().contains(Role.ADMIN))
            .forEach(admin -> notificationService.createNotification(admin.getId(), cancelMsg, Notification.NotificationType.BOOKING_CANCELLED));

        return toResponse(saved);
    }

    public void deleteBooking(String bookingId) {
        bookingRepository.delete(getBookingOrThrow(bookingId));
    }

    public void deleteBooking(String bookingId, String requesterId) {
        Booking booking = getBookingOrThrow(bookingId);
        User requester = getUserOrThrow(requesterId);

        if (!Objects.equals(booking.getRequesterId(), requester.getId())) {
            throw new BadRequestException("Only the requester can delete this booking");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only pending bookings can be deleted");
        }

        bookingRepository.delete(booking);
    }

    private void ensureNoConflict(
            String resourceId,
            LocalDate bookingDate,
            java.time.LocalTime startTime,
            java.time.LocalTime endTime,
            String excludeBookingId) {
        boolean hasConflict = !findConflictingBookings(resourceId, bookingDate, startTime, endTime, excludeBookingId).isEmpty();

        if (hasConflict) {
            throw new ConflictException("The selected resource is already booked for the requested time");
        }
    }

    public java.util.List<BookingResponseDTO> findConflictingBookings(
            String resourceId,
            LocalDate bookingDate,
            java.time.LocalTime startTime,
            java.time.LocalTime endTime,
            String excludeBookingId) {

        return bookingRepository.findAll().stream()
                .filter(booking -> Objects.equals(booking.getResourceId(), resourceId))
                .filter(booking -> Objects.equals(booking.getBookingDate(), bookingDate))
                .filter(booking -> booking.getStatus() == BookingStatus.APPROVED)
                .filter(booking -> excludeBookingId == null || !Objects.equals(booking.getId(), excludeBookingId))
                .filter(booking -> booking.getStartTime().isBefore(endTime) && booking.getEndTime().isAfter(startTime))
                .map(this::toResponse)
                .toList();
    }

    private void validateBookingWindow(java.time.LocalTime startTime, java.time.LocalTime endTime) {
        if (!startTime.isBefore(endTime)) {
            throw new BadRequestException("Start time must be before end time");
        }
    }

    private void validateRequesterRole(User requester) {
        if (requester.getRoles() == null || !requester.getRoles().contains(Role.USER)) {
            throw new BadRequestException("Only users can create bookings");
        }
    }

    private void validateAdminRole(User admin) {
        if (admin.getRoles() == null || !admin.getRoles().contains(Role.ADMIN)) {
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
            .or(() -> userRepository.findByEmail(userId))
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id or email: " + userId));
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
                Booking::getResourceId,
                        Collectors.counting()));
    }

        private ResourceBookingStatDTO mapToResourceStat(
            Entry<String, List<Booking>> entry,
            Long approvedBookings,
            Map<String, Resource> resourcesById) {
        Resource resource = resourcesById.get(entry.getKey());

        return ResourceBookingStatDTO.builder()
            .resourceId(entry.getKey())
            .resourceName(resource != null ? resource.getName() : "Unknown resource")
                .totalBookings(entry.getValue().size())
                .approvedBookings(approvedBookings != null ? approvedBookings : 0L)
                .build();
    }

    private BookingResponseDTO toResponse(Booking booking) {
        Resource resource = getResourceOrThrow(booking.getResourceId());
        User requester = getUserOrThrow(booking.getRequesterId());
        User reviewer = booking.getReviewedById() != null ? getUserOrThrow(booking.getReviewedById()) : null;

        return BookingResponseDTO.builder()
                .id(booking.getId())
            .resourceId(resource.getId())
            .resourceName(resource.getName())
            .resourceType(resource.getType().name())
            .resourceLocation(resource.getLocation())
            .requesterId(requester.getId())
            .requesterName(requester.getName())
            .requesterEmail(requester.getEmail())
                .bookingDate(booking.getBookingDate())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .purpose(booking.getPurpose())
                .expectedAttendees(booking.getExpectedAttendees())
                .status(booking.getStatus())
                .adminReason(booking.getAdminReason())
                .cancellationReason(booking.getCancellationReason())
            .reviewedById(reviewer != null ? reviewer.getId() : null)
            .reviewedByName(reviewer != null ? reviewer.getName() : null)
            .createdAt(booking.getCreatedAt() != null ? java.time.LocalDateTime.ofInstant(booking.getCreatedAt(), java.time.ZoneId.systemDefault()) : null)
            .updatedAt(booking.getUpdatedAt() != null ? java.time.LocalDateTime.ofInstant(booking.getUpdatedAt(), java.time.ZoneId.systemDefault()) : null)
                .build();
    }
}
