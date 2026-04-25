package com.Smart_Campus_Operations_Hub.Campus_Hub.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.Smart_Campus_Operations_Hub.Campus_Hub.model.Booking;
import com.Smart_Campus_Operations_Hub.Campus_Hub.model.Booking.BookingStatus;

public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByRequesterIdOrderByBookingDateDescStartTimeDesc(String requesterId);

    List<Booking> findByStatusOrderByBookingDateDescStartTimeDesc(BookingStatus status);

    List<Booking> findByResourceIdAndBookingDateAndStatusIn(String resourceId, LocalDate bookingDate, List<BookingStatus> statuses);
}
