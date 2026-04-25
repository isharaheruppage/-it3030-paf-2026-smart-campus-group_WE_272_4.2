package com.Smart_Campus_Operations_Hub.Campus_Hub.resource.dto;

import com.Smart_Campus_Operations_Hub.Campus_Hub.resource.ResourceStatus;
import com.Smart_Campus_Operations_Hub.Campus_Hub.resource.ResourceType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalTime;

public record CreateResourceRequest(
        @NotBlank(message = "name is required")
        String name,
        @NotNull(message = "type is required")
        ResourceType type,
        @NotNull(message = "capacity is required")
        @Min(value = 0, message = "capacity must be >= 0")
        Integer capacity,
        @NotBlank(message = "location is required")
        String location,
        @NotNull(message = "availableFrom is required")
        LocalTime availableFrom,
        @NotNull(message = "availableTo is required")
        LocalTime availableTo,
        @NotNull(message = "status is required")
        ResourceStatus status
) {
}
