package com.Smart_Campus_Operations_Hub.Campus_Hub.controller;

import com.Smart_Campus_Operations_Hub.Campus_Hub.model.User;
import com.Smart_Campus_Operations_Hub.Campus_Hub.repository.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<UserSummaryDTO>> getAllUsers() {
        List<UserSummaryDTO> users = userRepository.findAll().stream()
                .map(user -> new UserSummaryDTO(user.getId(), user.getUsername(), user.getFirstName(), user.getLastName(), user.getEmail(), user.getRole()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @Data
    private static class UserSummaryDTO {
        private Long id;
        private String username;
        private String firstName;
        private String lastName;
        private String email;
        private User.Role role;

        public UserSummaryDTO(Long id, String username, String firstName, String lastName, String email, User.Role role) {
            this.id = id;
            this.username = username;
            this.firstName = firstName;
            this.lastName = lastName;
            this.email = email;
            this.role = role;
        }
    }
}
