package com.Smart_Campus_Operations_Hub.Campus_Hub.config;

import com.Smart_Campus_Operations_Hub.Campus_Hub.model.Resource;
import com.Smart_Campus_Operations_Hub.Campus_Hub.model.User;
import com.Smart_Campus_Operations_Hub.Campus_Hub.repository.ResourceRepository;
import com.Smart_Campus_Operations_Hub.Campus_Hub.repository.UserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Configuration
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;

    public DataInitializer(UserRepository userRepository, ResourceRepository resourceRepository) {
        this.userRepository = userRepository;
        this.resourceRepository = resourceRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepository.count() == 0) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@campushub.edu");
            admin.setPassword("admin");
            admin.setRole(User.Role.ADMIN);
            admin.setFirstName("Admin");
            admin.setLastName("User");
            admin.setPhone("+000000000");
            userRepository.save(admin);

            User technician = new User();
            technician.setUsername("tech1");
            technician.setEmail("tech1@campushub.edu");
            technician.setPassword("tech1");
            technician.setRole(User.Role.TECHNICIAN);
            technician.setFirstName("Tech");
            technician.setLastName("One");
            technician.setPhone("+000000001");
            userRepository.save(technician);

            User regular = new User();
            regular.setUsername("student");
            regular.setEmail("student@campushub.edu");
            regular.setPassword("student");
            regular.setRole(User.Role.USER);
            regular.setFirstName("Student");
            regular.setLastName("User");
            regular.setPhone("+000000002");
            userRepository.save(regular);
        }

        if (resourceRepository.count() == 0) {
            Resource lectureHall = new Resource();
            lectureHall.setName("Hall A");
            lectureHall.setType(Resource.ResourceType.LECTURE_HALL);
            lectureHall.setLocation("Main Building");
            lectureHall.setCapacity(120);
            lectureHall.setStatus(Resource.Status.ACTIVE);
            lectureHall.setDescription("Large lecture hall with projection and audio");
            resourceRepository.save(lectureHall);

            Resource lab = new Resource();
            lab.setName("Lab 3");
            lab.setType(Resource.ResourceType.LAB);
            lab.setLocation("Science Block");
            lab.setCapacity(30);
            lab.setStatus(Resource.Status.ACTIVE);
            lab.setDescription("Computer lab with 30 workstations");
            resourceRepository.save(lab);

            Resource camera = new Resource();
            camera.setName("8K Camera");
            camera.setType(Resource.ResourceType.EQUIPMENT);
            camera.setLocation("Media Center");
            camera.setCapacity(1);
            camera.setStatus(Resource.Status.ACTIVE);
            camera.setDescription("High-speed recording camera");
            resourceRepository.save(camera);
        }
    }
}
