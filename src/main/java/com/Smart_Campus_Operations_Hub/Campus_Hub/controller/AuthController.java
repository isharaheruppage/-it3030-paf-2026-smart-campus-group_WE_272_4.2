package com.Smart_Campus_Operations_Hub.Campus_Hub.controller;

import com.Smart_Campus_Operations_Hub.Campus_Hub.dto.request.LoginRequest;
import com.Smart_Campus_Operations_Hub.Campus_Hub.dto.request.OtpRequest;
import com.Smart_Campus_Operations_Hub.Campus_Hub.dto.request.RegisterRequest;
import com.Smart_Campus_Operations_Hub.Campus_Hub.dto.response.AuthResponse;
import com.Smart_Campus_Operations_Hub.Campus_Hub.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest) {
        // Automatically create a dummy user if it's test@test.com for testing without postman DB insertion
        if (loginRequest.getEmail().equals("test@test.com")) {
            authService.createDummyUserIfNotExists("test@test.com", "password123");
        }

        String token = authService.authenticateUser(loginRequest.getEmail(), loginRequest.getPassword());
        return ResponseEntity.ok(new AuthResponse(token, "Login successful"));
    }

    @PostMapping("/generate-otp")
    public ResponseEntity<?> generateOtp(@RequestParam String email) {
        try {
            authService.generateAndSendOtp(email);
            return ResponseEntity.ok("OTP generated and sent successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody OtpRequest otpRequest) {
        try {
            String token = authService.verifyOtp(otpRequest.getEmail(), otpRequest.getOtpCode());
            return ResponseEntity.ok(new AuthResponse(token, "OTP verified successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            authService.registerUser(request.getName(), request.getEmail(), request.getPassword(), request.getRole());
            return ResponseEntity.ok("Registration successful! You can now log in.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
