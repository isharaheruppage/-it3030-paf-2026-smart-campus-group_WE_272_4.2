package com.Smart_Campus_Operations_Hub.Campus_Hub.resource;

import com.Smart_Campus_Operations_Hub.Campus_Hub.resource.dto.CreateResourceRequest;
import com.Smart_Campus_Operations_Hub.Campus_Hub.resource.dto.ResourceResponse;
import com.Smart_Campus_Operations_Hub.Campus_Hub.resource.dto.UpdateResourceRequest;
import java.util.List;
import java.time.LocalTime;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
public class ResourceService {
    private final ResourceRepository resourceRepository;

    public ResourceService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    @Transactional
    public ResourceResponse create(CreateResourceRequest request) {
        Resource resource = new Resource();
        resource.setName(request.name().trim());
        resource.setType(request.type());
        resource.setCapacity(request.capacity());
        resource.setLocation(request.location().trim());
        validateAvailabilityWindow(request.availableFrom(), request.availableTo());
        resource.setAvailableFrom(request.availableFrom());
        resource.setAvailableTo(request.availableTo());
        resource.setStatus(request.status());
        return toResponse(resourceRepository.save(resource));
    }

    @Transactional(readOnly = true)
    public List<ResourceResponse> list(
            ResourceType type,
            Integer minCapacity,
            String location,
            ResourceStatus status,
            LocalTime availableFrom,
            LocalTime availableTo
    ) {
        Specification<Resource> specification = Specification.allOf(
                ResourceSpecifications.hasType(type),
                ResourceSpecifications.minCapacity(minCapacity),
                ResourceSpecifications.hasLocation(location),
                ResourceSpecifications.hasStatus(status),
                ResourceSpecifications.availableFromAtOrBefore(availableFrom),
                ResourceSpecifications.availableToAtOrAfter(availableTo)
        );

        return resourceRepository.findAll(specification).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ResourceResponse getById(Long id) {
        return toResponse(findByIdOrThrow(id));
    }

    @Transactional
    public ResourceResponse patch(Long id, UpdateResourceRequest request) {
        Resource resource = findByIdOrThrow(id);

        if (request.name() != null) {
            resource.setName(request.name().trim());
        }
        if (request.type() != null) {
            resource.setType(request.type());
        }
        if (request.capacity() != null) {
            resource.setCapacity(request.capacity());
        }
        if (request.location() != null) {
            resource.setLocation(request.location().trim());
        }
        LocalTime nextAvailableFrom = request.availableFrom() != null ? request.availableFrom() : resource.getAvailableFrom();
        LocalTime nextAvailableTo = request.availableTo() != null ? request.availableTo() : resource.getAvailableTo();
        validateAvailabilityWindow(nextAvailableFrom, nextAvailableTo);
        if (request.availableFrom() != null) {
            resource.setAvailableFrom(request.availableFrom());
        }
        if (request.availableTo() != null) {
            resource.setAvailableTo(request.availableTo());
        }
        if (request.status() != null) {
            resource.setStatus(request.status());
        }

        return toResponse(resourceRepository.save(resource));
    }

    @Transactional
    public void deactivate(Long id) {
        Resource resource = findByIdOrThrow(id);
        resource.setStatus(ResourceStatus.INACTIVE);
        resourceRepository.save(resource);
    }

    private Resource findByIdOrThrow(Long id) {
        return resourceRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(id));
    }

    private ResourceResponse toResponse(Resource resource) {
        return new ResourceResponse(
                resource.getId(),
                resource.getName(),
                resource.getType(),
                resource.getCapacity(),
                resource.getLocation(),
                resource.getAvailableFrom(),
                resource.getAvailableTo(),
                resource.getStatus(),
                resource.getCreatedAt(),
                resource.getUpdatedAt()
        );
    }

    private void validateAvailabilityWindow(LocalTime availableFrom, LocalTime availableTo) {
        if (availableFrom == null || availableTo == null || !availableFrom.isBefore(availableTo)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "availableFrom must be earlier than availableTo"
            );
        }
    }
}
