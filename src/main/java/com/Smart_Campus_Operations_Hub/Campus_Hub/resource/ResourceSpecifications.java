package com.Smart_Campus_Operations_Hub.Campus_Hub.resource;

import org.springframework.data.jpa.domain.Specification;
import java.time.LocalTime;

public final class ResourceSpecifications {
    private ResourceSpecifications() {
    }

    public static Specification<Resource> hasType(ResourceType type) {
        return (root, query, builder) ->
                type == null ? builder.conjunction() : builder.equal(root.get("type"), type);
    }

    public static Specification<Resource> minCapacity(Integer minCapacity) {
        return (root, query, builder) ->
                minCapacity == null ? builder.conjunction() : builder.greaterThanOrEqualTo(root.get("capacity"), minCapacity);
    }

    public static Specification<Resource> hasLocation(String location) {
        return (root, query, builder) ->
                location == null || location.isBlank()
                        ? builder.conjunction()
                        : builder.like(builder.lower(root.get("location")), "%" + location.trim().toLowerCase() + "%");
    }

    public static Specification<Resource> hasStatus(ResourceStatus status) {
        return (root, query, builder) ->
                status == null ? builder.conjunction() : builder.equal(root.get("status"), status);
    }

    public static Specification<Resource> availableFromAtOrBefore(LocalTime availableFrom) {
        return (root, query, builder) ->
                availableFrom == null ? builder.conjunction() : builder.lessThanOrEqualTo(root.get("availableFrom"), availableFrom);
    }

    public static Specification<Resource> availableToAtOrAfter(LocalTime availableTo) {
        return (root, query, builder) ->
                availableTo == null ? builder.conjunction() : builder.greaterThanOrEqualTo(root.get("availableTo"), availableTo);
    }
}
