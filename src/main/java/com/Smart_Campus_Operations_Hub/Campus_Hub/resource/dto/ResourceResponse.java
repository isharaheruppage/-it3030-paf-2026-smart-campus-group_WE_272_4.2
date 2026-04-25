package com.Smart_Campus_Operations_Hub.Campus_Hub.resource.dto;

import com.Smart_Campus_Operations_Hub.Campus_Hub.resource.ResourceStatus;
import com.Smart_Campus_Operations_Hub.Campus_Hub.resource.ResourceType;
import java.time.Instant;
import java.time.LocalTime;

public record ResourceResponse(
        String id,
        String name,
        ResourceType type,
        Integer capacity,
        String location,
        LocalTime availableFrom,
        LocalTime availableTo,
        ResourceStatus status,
        Instant createdAt,
        Instant updatedAt
) {
}
