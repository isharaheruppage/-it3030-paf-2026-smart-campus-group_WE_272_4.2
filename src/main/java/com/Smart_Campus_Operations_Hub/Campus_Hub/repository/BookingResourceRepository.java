package com.Smart_Campus_Operations_Hub.Campus_Hub.repository;

import com.Smart_Campus_Operations_Hub.Campus_Hub.model.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface BookingResourceRepository extends MongoRepository<Resource, String> {
}