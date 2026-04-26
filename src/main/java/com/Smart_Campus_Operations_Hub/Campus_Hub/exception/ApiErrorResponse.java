package com.Smart_Campus_Operations_Hub.Campus_Hub.exception;

import java.util.Map;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ApiErrorResponse {

    // Use ISO string to avoid LocalDateTime serialization issues in error handlers
    private final String timestamp;
    private final int status;
    private final String error;
    private final String message;
    private final String path;
    private final Map<String, String> validationErrors;
}
