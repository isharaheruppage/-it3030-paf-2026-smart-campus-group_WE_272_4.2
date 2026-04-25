package com.Smart_Campus_Operations_Hub.Campus_Hub.dto.request;

import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String role;
}
