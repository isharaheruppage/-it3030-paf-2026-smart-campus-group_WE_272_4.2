package com.Smart_Campus_Operations_Hub.Campus_Hub.common;

import java.time.Instant;

public record ApiError(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path
) {
}
