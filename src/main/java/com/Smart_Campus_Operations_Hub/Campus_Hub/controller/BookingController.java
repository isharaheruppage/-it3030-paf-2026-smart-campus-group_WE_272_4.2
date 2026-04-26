package com.Smart_Campus_Operations_Hub.Campus_Hub.controller;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Smart_Campus_Operations_Hub.Campus_Hub.dto.request.BookingRequestDTO;
import com.Smart_Campus_Operations_Hub.Campus_Hub.dto.request.BookingReviewRequestDTO;
import com.Smart_Campus_Operations_Hub.Campus_Hub.dto.response.BookingAnalyticsDTO;
import com.Smart_Campus_Operations_Hub.Campus_Hub.dto.response.BookingResponseDTO;
import com.Smart_Campus_Operations_Hub.Campus_Hub.model.Booking.BookingStatus;
import com.Smart_Campus_Operations_Hub.Campus_Hub.service.BookingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingResponseDTO> createBooking(@Valid @RequestBody BookingRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.createBooking(request));
    }

    @PutMapping("/{bookingId}")
    public ResponseEntity<BookingResponseDTO> updateBooking(
            @PathVariable String bookingId,
            @Valid @RequestBody BookingRequestDTO request) {
        return ResponseEntity.ok(bookingService.updateBooking(bookingId, request));
    }

    @GetMapping
    public ResponseEntity<List<BookingResponseDTO>> getAllBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) String resourceId,
            @RequestParam(required = false) String requesterId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate bookingDate) {
        return ResponseEntity.ok(bookingService.getAllBookings(status, resourceId, requesterId, bookingDate));
    }

    @GetMapping("/admin/analytics")
    public ResponseEntity<BookingAnalyticsDTO> getAdminBookingAnalytics(@RequestParam String adminId) {
        return ResponseEntity.ok(bookingService.getAdminBookingAnalytics(adminId));
    }

    @GetMapping("/users/{requesterId}")
    public ResponseEntity<List<BookingResponseDTO>> getBookingsByRequester(@PathVariable String requesterId) {
        return ResponseEntity.ok(bookingService.getBookingsByRequester(requesterId));
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<BookingResponseDTO> getBookingById(@PathVariable String bookingId) {
        return ResponseEntity.ok(bookingService.getBookingById(bookingId));
    }

    @GetMapping("/availability")
    public ResponseEntity<Map<String, Object>> checkAvailability(
            @RequestParam String resourceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate bookingDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime endTime,
            @RequestParam(required = false) String excludeBookingId) {

        var conflicts = bookingService.findConflictingBookings(resourceId, bookingDate, startTime, endTime, excludeBookingId);
        Map<String, Object> resp = new HashMap<>();
        resp.put("available", conflicts == null || conflicts.isEmpty());
        resp.put("conflicts", conflicts);
        return ResponseEntity.ok(resp);
    }

    @PatchMapping("/{bookingId}/review")
    public ResponseEntity<BookingResponseDTO> reviewBooking(
            @PathVariable String bookingId,
            @Valid @RequestBody BookingReviewRequestDTO request) {
        return ResponseEntity.ok(bookingService.reviewBooking(bookingId, request));
    }

    @PatchMapping("/{bookingId}/cancel")
    public ResponseEntity<BookingResponseDTO> cancelBooking(
            @PathVariable String bookingId,
            @RequestParam String requesterId,
            @RequestParam String reason) {
        return ResponseEntity.ok(bookingService.cancelBooking(bookingId, requesterId, reason));
    }

    @DeleteMapping("/{bookingId}")
    public ResponseEntity<Void> deleteBooking(
            @PathVariable String bookingId,
            @RequestParam String requesterId) {
        bookingService.deleteBooking(bookingId, requesterId);
        return ResponseEntity.noContent().build();
    }
}
