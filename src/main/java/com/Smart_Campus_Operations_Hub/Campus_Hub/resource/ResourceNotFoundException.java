package com.Smart_Campus_Operations_Hub.Campus_Hub.resource;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(Long id) {
        super("Resource not found for id: " + id);
    }
}
