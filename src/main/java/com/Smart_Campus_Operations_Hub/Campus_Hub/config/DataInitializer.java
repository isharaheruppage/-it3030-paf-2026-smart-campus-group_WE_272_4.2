package com.Smart_Campus_Operations_Hub.Campus_Hub.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.Smart_Campus_Operations_Hub.Campus_Hub.model.Role;
import com.Smart_Campus_Operations_Hub.Campus_Hub.model.Resource;
import com.Smart_Campus_Operations_Hub.Campus_Hub.model.User;
import com.Smart_Campus_Operations_Hub.Campus_Hub.repository.ResourceRepository;
import com.Smart_Campus_Operations_Hub.Campus_Hub.repository.UserRepository;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seedBaseData(UserRepository userRepository, ResourceRepository resourceRepository) {
        return args -> {
            if (userRepository.count() == 0) {
                userRepository.save(User.builder()
                        .fullName("Admin User")
                        .email("admin@smartcampus.local")
                        .role(Role.ADMIN)
                        .build());

                userRepository.save(User.builder()
                        .fullName("Student User")
                        .email("student@smartcampus.local")
                        .role(Role.USER)
                        .build());
            }

            if (resourceRepository.count() == 0) {
                resourceRepository.save(Resource.builder()
                        .name("Lab 3A")
                        .type(Resource.ResourceType.LAB)
                        .capacity(40)
                        .location("Engineering Building - Floor 3")
                        .availabilityWindow("08:00-18:00")
                        .status(Resource.ResourceStatus.ACTIVE)
                        .build());

                resourceRepository.save(Resource.builder()
                        .name("Conference Room B")
                        .type(Resource.ResourceType.MEETING_ROOM)
                        .capacity(12)
                        .location("Administration Block")
                        .availabilityWindow("09:00-17:00")
                        .status(Resource.ResourceStatus.ACTIVE)
                        .build());
            }
        };
    }
}
