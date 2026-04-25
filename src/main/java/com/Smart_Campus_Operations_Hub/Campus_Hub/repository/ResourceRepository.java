package com.Smart_Campus_Operations_Hub.Campus_Hub.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.Smart_Campus_Operations_Hub.Campus_Hub.model.Resource;

public interface ResourceRepository extends MongoRepository<Resource, String> {
}
