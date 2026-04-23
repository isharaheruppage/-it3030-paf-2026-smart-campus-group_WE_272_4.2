package com.Smart_Campus_Operations_Hub.Campus_Hub.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Smart_Campus_Operations_Hub.Campus_Hub.model.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
}
