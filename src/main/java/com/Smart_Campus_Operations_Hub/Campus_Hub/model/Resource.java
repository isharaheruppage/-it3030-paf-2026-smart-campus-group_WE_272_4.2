package com.Smart_Campus_Operations_Hub.Campus_Hub.model;

import java.time.Instant;
import java.time.LocalTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "resources")
public class Resource {

    @Id
    private String id;

    private String name;

    private ResourceType type;

    private Integer capacity;

    private String location;

    private LocalTime availableFrom;

    private LocalTime availableTo;

    private ResourceStatus status;

    private Instant createdAt;

    private Instant updatedAt;

    public enum ResourceType {
        LECTURE_HALL,
        LAB,
        MEETING_ROOM,
        EQUIPMENT
    }

    public enum ResourceStatus {
        ACTIVE,
        OUT_OF_SERVICE,
        INACTIVE
    }
}
