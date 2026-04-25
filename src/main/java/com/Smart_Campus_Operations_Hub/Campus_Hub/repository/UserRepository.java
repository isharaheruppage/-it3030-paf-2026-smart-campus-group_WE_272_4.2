package com.Smart_Campus_Operations_Hub.Campus_Hub.repository;

<<<<<<< HEAD
import com.Smart_Campus_Operations_Hub.Campus_Hub.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
=======
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Smart_Campus_Operations_Hub.Campus_Hub.model.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
>>>>>>> origin/Booking-workflow,confict-checking
}
