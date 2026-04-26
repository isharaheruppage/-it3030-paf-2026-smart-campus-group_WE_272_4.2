package com.Smart_Campus_Operations_Hub.Campus_Hub.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "users")
public class User {

    @Id
    private String id;
    
    private String name;
    
    private String email;
    
    @JsonIgnore
    private String password; // Nullable for OAuth users
    
    private Set<Role> roles;
    
    private AuthProvider provider;
    
    private String providerId;
    
    // OTP fields
    private String otpCode;
    private LocalDateTime otpExpiry;
    
    public enum AuthProvider {
        LOCAL, GOOGLE, FACEBOOK
    }
}
