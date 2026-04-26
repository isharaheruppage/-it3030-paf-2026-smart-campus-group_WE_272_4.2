package com.Smart_Campus_Operations_Hub.Campus_Hub.config;

import java.time.LocalTime;
import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;

import com.Smart_Campus_Operations_Hub.Campus_Hub.model.Booking;
import com.Smart_Campus_Operations_Hub.Campus_Hub.model.Role;
import com.Smart_Campus_Operations_Hub.Campus_Hub.model.Resource;
import com.Smart_Campus_Operations_Hub.Campus_Hub.model.User;
import com.Smart_Campus_Operations_Hub.Campus_Hub.repository.BookingResourceRepository;
import com.Smart_Campus_Operations_Hub.Campus_Hub.repository.UserRepository;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seedBaseData(
            UserRepository userRepository,
            BookingResourceRepository resourceRepository,
            MongoTemplate mongoTemplate) {
        return args -> {
            if (userRepository.count() == 0) {
                userRepository.save(User.builder()
                    .name("Admin User")
                        .email("admin@smartcampus.local")
                    .roles(Set.of(Role.ADMIN))
                        .build());

                userRepository.save(User.builder()
                    .name("Student User")
                        .email("student@smartcampus.local")
                    .roles(Set.of(Role.USER))
                        .build());
            }

            if (resourceRepository.count() == 0) {
                resourceRepository.save(Resource.builder()
                        .name("Lab 3A")
                        .type(Resource.ResourceType.LAB)
                        .capacity(40)
                        .location("Engineering Building - Floor 3")
                    .availableFrom(LocalTime.of(8, 0))
                    .availableTo(LocalTime.of(18, 0))
                        .status(Resource.ResourceStatus.ACTIVE)
                        .build());

                resourceRepository.save(Resource.builder()
                        .name("Conference Room B")
                        .type(Resource.ResourceType.MEETING_ROOM)
                        .capacity(12)
                        .location("Administration Block")
                    .availableFrom(LocalTime.of(9, 0))
                    .availableTo(LocalTime.of(17, 0))
                        .status(Resource.ResourceStatus.ACTIVE)
                        .build());
            }

            if (!mongoTemplate.collectionExists(Booking.class)) {
                mongoTemplate.createCollection(Booking.class);
            }
        };
    }
}
