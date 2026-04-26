package com.Smart_Campus_Operations_Hub.Campus_Hub.resource;

import com.Smart_Campus_Operations_Hub.Campus_Hub.resource.dto.CreateResourceRequest;
import com.Smart_Campus_Operations_Hub.Campus_Hub.resource.dto.ResourceResponse;
import com.Smart_Campus_Operations_Hub.Campus_Hub.resource.dto.UpdateResourceRequest;
import org.bson.Document;
import java.time.LocalTime;
import java.time.Instant;
import java.time.ZoneId;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.Objects;
import java.util.List;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

@Service
public class ResourceService {
    private final ResourceRepository resourceRepository;
    private final MongoTemplate mongoTemplate;

    public ResourceService(ResourceRepository resourceRepository, MongoTemplate mongoTemplate) {
        this.resourceRepository = resourceRepository;
        this.mongoTemplate = mongoTemplate;
    }

    public ResourceResponse create(CreateResourceRequest request) {
        Resource resource = new Resource();
        resource.setName(request.name().trim());
        resource.setType(request.type());
        resource.setCapacity(request.capacity());
        resource.setLocation(request.location().trim());
        validateAvailabilityWindow(request.availableFrom(), request.availableTo());
        resource.setAvailableFrom(request.availableFrom());
        resource.setAvailableTo(request.availableTo());
        resource.setStatus(request.status());
        resource.setCreatedAt(Instant.now());
        resource.setUpdatedAt(resource.getCreatedAt());
        return toResponse(resourceRepository.save(resource));
    }

    public List<ResourceResponse> list(
            ResourceType type,
            Integer minCapacity,
            String location,
            ResourceStatus status,
            LocalTime availableFrom,
            LocalTime availableTo
    ) {
        Query query = ResourceSpecifications.buildQuery(type, minCapacity, location, status, availableFrom, availableTo);
        return mongoTemplate.find(Objects.requireNonNull(query), Document.class, "resources").stream()
            .map(this::toResponse)
            .filter(java.util.Objects::nonNull)
            .toList();
    }

    public ResourceResponse getById(String id) {
        return toResponse(findByIdOrThrow(id));
    }

    public ResourceResponse patch(String id, UpdateResourceRequest request) {
        Resource resource = findByIdOrThrow(id);

        if (request.name() != null) {
            resource.setName(request.name().trim());
        }
        if (request.type() != null) {
            resource.setType(request.type());
        }
        if (request.capacity() != null) {
            resource.setCapacity(request.capacity());
        }
        if (request.location() != null) {
            resource.setLocation(request.location().trim());
        }
        LocalTime nextAvailableFrom = request.availableFrom() != null ? request.availableFrom() : resource.getAvailableFrom();
        LocalTime nextAvailableTo = request.availableTo() != null ? request.availableTo() : resource.getAvailableTo();
        validateAvailabilityWindow(nextAvailableFrom, nextAvailableTo);
        if (request.availableFrom() != null) {
            resource.setAvailableFrom(request.availableFrom());
        }
        if (request.availableTo() != null) {
            resource.setAvailableTo(request.availableTo());
        }
        if (request.status() != null) {
            resource.setStatus(request.status());
        }
        resource.setUpdatedAt(Instant.now());

        return toResponse(resourceRepository.save(resource));
    }

    public void delete(String id) {
        Resource resource = findByIdOrThrow(id);
        resourceRepository.delete(Objects.requireNonNull(resource));
    }

    private Resource findByIdOrThrow(String id) {
        return resourceRepository.findById(Objects.requireNonNull(id)).orElseThrow(() -> new ResourceNotFoundException(id));
    }

    private ResourceResponse toResponse(Resource resource) {
        return new ResourceResponse(
                resource.getId(),
                resource.getName(),
                resource.getType(),
                resource.getCapacity(),
                resource.getLocation(),
                resource.getAvailableFrom(),
                resource.getAvailableTo(),
                resource.getStatus(),
                resource.getCreatedAt(),
                resource.getUpdatedAt()
        );
    }

    private ResourceResponse toResponse(Document document) {
        try {
            String id = document.get("_id") == null ? null : String.valueOf(document.get("_id"));
            String name = document.getString("name");
            ResourceType type = parseResourceType(document.get("type"));
            Integer capacity = document.getInteger("capacity");
            String location = document.getString("location");
            LocalTime availableFrom = parseLocalTime(document.get("availableFrom"));
            LocalTime availableTo = parseLocalTime(document.get("availableTo"));
            ResourceStatus status = parseResourceStatus(document.get("status"));
            Instant createdAt = parseInstant(document.get("createdAt"));
            Instant updatedAt = parseInstant(document.get("updatedAt"));

            if (id == null || name == null || type == null || capacity == null || location == null
                    || availableFrom == null || availableTo == null || status == null) {
                return null;
            }

            return new ResourceResponse(id, name, type, capacity, location, availableFrom, availableTo, status, createdAt, updatedAt);
        } catch (RuntimeException exception) {
            return null;
        }
    }

    private ResourceType parseResourceType(Object value) {
        if (value == null) {
            return null;
        }

        if (value instanceof ResourceType resourceType) {
            return resourceType;
        }

        try {
            return ResourceType.valueOf(value.toString());
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }

    private ResourceStatus parseResourceStatus(Object value) {
        if (value == null) {
            return null;
        }

        if (value instanceof ResourceStatus resourceStatus) {
            return resourceStatus;
        }

        try {
            return ResourceStatus.valueOf(value.toString());
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }

    private LocalTime parseLocalTime(Object value) {
        if (value == null) {
            return null;
        }

        if (value instanceof LocalTime localTime) {
            return localTime;
        }

        if (value instanceof LocalDateTime localDateTime) {
            return localDateTime.toLocalTime();
        }

        if (value instanceof java.util.Date date) {
            return date.toInstant().atZone(ZoneId.systemDefault()).toLocalTime();
        }

        try {
            return LocalTime.parse(value.toString());
        } catch (DateTimeParseException exception) {
            return null;
        }
    }

    private Instant parseInstant(Object value) {
        if (value == null) {
            return null;
        }

        if (value instanceof Instant instant) {
            return instant;
        }

        if (value instanceof java.util.Date date) {
            return date.toInstant();
        }

        try {
            return Instant.parse(value.toString());
        } catch (DateTimeParseException exception) {
            return null;
        }
    }

    private void validateAvailabilityWindow(LocalTime availableFrom, LocalTime availableTo) {
        if (availableFrom == null || availableTo == null || !availableFrom.isBefore(availableTo)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "availableFrom must be earlier than availableTo"
            );
        }
    }
}
