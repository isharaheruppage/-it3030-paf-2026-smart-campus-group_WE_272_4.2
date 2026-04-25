package com.Smart_Campus_Operations_Hub.Campus_Hub.dto.response;

import java.util.List;

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
public class BookingAnalyticsDTO {

    private long totalBookings;
    private long pendingBookings;
    private long approvedBookings;
    private long rejectedBookings;
    private long cancelledBookings;
    private long todaysBookings;
    private long upcomingApprovedBookings;
    private double approvalRate;
    private List<ResourceBookingStatDTO> topResources;
}
