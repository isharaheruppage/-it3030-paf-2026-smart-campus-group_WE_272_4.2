package com.Smart_Campus_Operations_Hub.Campus_Hub.repository;

import com.Smart_Campus_Operations_Hub.Campus_Hub.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface BookingRepository extends MongoRepository<Booking, String> {
}
