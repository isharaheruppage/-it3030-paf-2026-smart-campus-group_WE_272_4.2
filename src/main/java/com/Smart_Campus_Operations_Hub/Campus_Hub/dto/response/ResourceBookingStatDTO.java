package com.Smart_Campus_Operations_Hub.Campus_Hub.dto.response;

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
public class ResourceBookingStatDTO {

    private Long resourceId;
    private String resourceName;
    private long totalBookings;
    private long approvedBookings;
}
