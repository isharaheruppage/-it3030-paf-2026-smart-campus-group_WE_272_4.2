package com.Smart_Campus_Operations_Hub.Campus_Hub.resource;

import com.Smart_Campus_Operations_Hub.Campus_Hub.resource.dto.CreateResourceRequest;
import com.Smart_Campus_Operations_Hub.Campus_Hub.resource.dto.ResourceResponse;
import com.Smart_Campus_Operations_Hub.Campus_Hub.resource.dto.UpdateResourceRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.time.LocalTime;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {
    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public ResourceResponse create(@Valid @RequestBody CreateResourceRequest request) {
        return resourceService.create(request);
    }

    @GetMapping
    public List<ResourceResponse> list(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) ResourceStatus status,
            @RequestParam(required = false) LocalTime availableFrom,
            @RequestParam(required = false) LocalTime availableTo
    ) {
        return resourceService.list(type, minCapacity, location, status, availableFrom, availableTo);
    }

    @GetMapping("/{id}")
    public ResourceResponse getById(@PathVariable String id) {
        return resourceService.getById(id);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResourceResponse patch(@PathVariable String id, @Valid @RequestBody UpdateResourceRequest request) {
        return resourceService.patch(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable String id) {
        resourceService.delete(id);
    }
}
