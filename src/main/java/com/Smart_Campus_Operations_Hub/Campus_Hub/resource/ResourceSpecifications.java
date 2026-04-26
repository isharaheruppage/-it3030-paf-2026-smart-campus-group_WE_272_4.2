package com.Smart_Campus_Operations_Hub.Campus_Hub.resource;

import java.util.ArrayList;
import java.util.List;
import java.time.LocalTime;
import java.util.regex.Pattern;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

public final class ResourceSpecifications {
    private ResourceSpecifications() {
    }

    public static Query buildQuery(
            ResourceType type,
            Integer minCapacity,
            String location,
            ResourceStatus status,
            LocalTime availableFrom,
            LocalTime availableTo
    ) {
        List<Criteria> criteria = new ArrayList<>();

        if (type != null) {
            criteria.add(Criteria.where("type").is(type));
        }
        if (minCapacity != null) {
            criteria.add(Criteria.where("capacity").gte(minCapacity));
        }
        if (location != null && !location.isBlank()) {
            Pattern pattern = Pattern.compile(".*" + Pattern.quote(location.trim()) + ".*", Pattern.CASE_INSENSITIVE);
            criteria.add(Criteria.where("location").regex(pattern));
        }
        if (status != null) {
            criteria.add(Criteria.where("status").is(status));
        }
        if (availableFrom != null) {
            criteria.add(Criteria.where("availableFrom").lte(availableFrom));
        }
        if (availableTo != null) {
            criteria.add(Criteria.where("availableTo").gte(availableTo));
        }

        Query query = new Query();
        if (!criteria.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteria.toArray(new Criteria[0])));
        }
        return query;
    }
}
