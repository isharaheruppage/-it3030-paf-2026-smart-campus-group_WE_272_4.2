package com.Smart_Campus_Operations_Hub.Campus_Hub.dto.request;

import lombok.Data;

@Data
public class OtpRequest {
    private String email;
    private String otpCode;
}
