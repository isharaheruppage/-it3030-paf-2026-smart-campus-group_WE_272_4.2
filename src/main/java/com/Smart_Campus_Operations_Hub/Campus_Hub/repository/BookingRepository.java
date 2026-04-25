package com.Smart_Campus_Operations_Hub.Campus_Hub.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.Smart_Campus_Operations_Hub.Campus_Hub.model.Booking;
import com.Smart_Campus_Operations_Hub.Campus_Hub.model.Booking.BookingStatus;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByRequesterIdOrderByBookingDateDescStartTimeDesc(Long requesterId);

    List<Booking> findByStatusOrderByBookingDateDescStartTimeDesc(BookingStatus status);

    @Query("""
            select b from Booking b
            where (:status is null or b.status = :status)
              and (:resourceId is null or b.resource.id = :resourceId)
              and (:requesterId is null or b.requester.id = :requesterId)
              and (:bookingDate is null or b.bookingDate = :bookingDate)
            order by b.bookingDate desc, b.startTime desc
            """)
    List<Booking> searchBookings(
            @Param("status") BookingStatus status,
            @Param("resourceId") Long resourceId,
            @Param("requesterId") Long requesterId,
            @Param("bookingDate") LocalDate bookingDate);

    @Query("""
            select case when count(b) > 0 then true else false end
            from Booking b
            where b.resource.id = :resourceId
              and b.bookingDate = :bookingDate
              and b.status in :activeStatuses
              and (:excludeBookingId is null or b.id <> :excludeBookingId)
              and b.startTime < :endTime
              and b.endTime > :startTime
            """)
    boolean existsConflict(
            @Param("resourceId") Long resourceId,
            @Param("bookingDate") LocalDate bookingDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("activeStatuses") Collection<BookingStatus> activeStatuses,
            @Param("excludeBookingId") Long excludeBookingId);
}
