package com.Smart_Campus_Operations_Hub.Campus_Hub.resource.dto;

import com.Smart_Campus_Operations_Hub.Campus_Hub.resource.ResourceStatus;
import com.Smart_Campus_Operations_Hub.Campus_Hub.resource.ResourceType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import java.time.LocalTime;

public record UpdateResourceRequest(
        @Size(min = 1, message = "name cannot be blank")
        String name,
        ResourceType type,
        @Min(value = 0, message = "capacity must be >= 0")
        Integer capacity,
        @Size(min = 1, message = "location cannot be blank")
        String location,
        LocalTime availableFrom,
        LocalTime availableTo,
        ResourceStatus status
) {
}
