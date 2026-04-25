package com.Smart_Campus_Operations_Hub.Campus_Hub.service;

import com.Smart_Campus_Operations_Hub.Campus_Hub.model.Role;
import com.Smart_Campus_Operations_Hub.Campus_Hub.model.User;
import com.Smart_Campus_Operations_Hub.Campus_Hub.repository.UserRepository;
import com.Smart_Campus_Operations_Hub.Campus_Hub.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;

    public String authenticateUser(String email, String password) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        return tokenProvider.generateToken(authentication);
    }

    public void generateAndSendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));
        user.setOtpCode(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5)); // Valid for 5 minutes
        userRepository.save(user);

        // Simulate sending OTP (Logging to console as requested/assumed)
        System.out.println("==================================================");
        System.out.println("OTP for " + email + " is: " + otp);
        System.out.println("==================================================");
    }

    public String verifyOtp(String email, String otpCode) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        if (user.getOtpCode() == null || !user.getOtpCode().equals(otpCode)) {
            throw new RuntimeException("Invalid OTP");
        }

        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }

        // OTP is valid. Clear it and generate token.
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        userRepository.save(user);

        return tokenProvider.generateTokenFromEmail(email);
    }

    // Helper method to create a dummy user for testing if the DB is empty
    public void createDummyUserIfNotExists(String email, String password) {
        if (!userRepository.existsByEmail(email)) {
            User user = User.builder()
                    .email(email)
                    .fullName("Test User")
                    .password(passwordEncoder.encode(password))
                    .roles(Collections.singleton(Role.USER))
                    .role(Role.USER)
                    .provider(User.AuthProvider.LOCAL)
                    .build();
            userRepository.save(user);
            System.out.println("Dummy user created: " + email + " / " + password);
        }
    }

    // Register a new user from the frontend form
    public void registerUser(String name, String email, String password, String roleStr) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email is already registered: " + email);
        }
        Role role;
        try {
            role = Role.valueOf(roleStr.toUpperCase());
        } catch (Exception e) {
            role = Role.USER;
        }
        User user = User.builder()
                .fullName(name)
                .email(email)
                .password(passwordEncoder.encode(password))
                .roles(Collections.singleton(role))
                .role(role)
                .provider(User.AuthProvider.LOCAL)
                .build();
        userRepository.save(user);
        System.out.println("New user registered: " + email + " [" + role + "]");
    }
}
