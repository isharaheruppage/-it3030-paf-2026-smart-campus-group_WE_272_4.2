package com.Smart_Campus_Operations_Hub.Campus_Hub.dto.response;

import com.Smart_Campus_Operations_Hub.Campus_Hub.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private String id;
    private String name;
    private String email;
    private Set<Role> roles;
    private String provider;
}