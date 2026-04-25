package com.Smart_Campus_Operations_Hub.Campus_Hub.controller;

import com.Smart_Campus_Operations_Hub.Campus_Hub.dto.*;
import com.Smart_Campus_Operations_Hub.Campus_Hub.entity.IncidentCategory;
import com.Smart_Campus_Operations_Hub.Campus_Hub.entity.IncidentPriority;
import com.Smart_Campus_Operations_Hub.Campus_Hub.entity.IncidentStatus;
import com.Smart_Campus_Operations_Hub.Campus_Hub.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.security.Principal;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<TicketResponseDto>>> getAllTickets(
            @RequestParam(required = false) IncidentStatus status,
            @RequestParam(required = false) IncidentCategory category,
            @RequestParam(required = false) IncidentPriority priority,
            @RequestParam(required = false) String assignedTo,
            Pageable pageable,
            Principal principal) {
        
        Page<TicketResponseDto> tickets = ticketService.getTickets(
                status, category, priority, assignedTo, pageable, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Tickets retrieved successfully", tickets));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketDetailDto>> getTicketById(
            @PathVariable UUID id,
            Principal principal) {
        
        TicketDetailDto ticket = ticketService.getTicketById(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Ticket retrieved successfully", ticket));
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<TicketResponseDto>> createTicket(
            @Valid @RequestPart("ticket") TicketCreateDto ticketCreateDto,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            Principal principal) {
        
        if (files != null && files.size() > 3) {
            throw new IllegalArgumentException("Maximum 3 files allowed.");
        }
        
        if (files != null) {
            for (MultipartFile file : files) {
                if (file.getSize() > 5 * 1024 * 1024) {
                    throw new IllegalArgumentException("File size must not exceed 5MB.");
                }
                String contentType = file.getContentType();
                if (contentType == null || !(contentType.equals("image/jpeg") || contentType.equals("image/png") || contentType.equals("image/webp"))) {
                    throw new IllegalArgumentException("Only JPEG, PNG and WEBP file types are allowed.");
                }
            }
        }

        TicketResponseDto createdTicket = ticketService.createTicket(ticketCreateDto, files, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Ticket created successfully", createdTicket));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<CommentDto>> addComment(
            @PathVariable UUID id,
            @Valid @RequestBody CommentCreateDto commentDto,
            Principal principal) {
        
        CommentDto createdComment = ticketService.addComment(id, commentDto, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Comment added successfully", createdComment));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<ApiResponse<TicketResponseDto>> updateTicketStatus(
            @PathVariable UUID id,
            @Valid @RequestBody TicketStatusUpdateDto statusUpdateDto,
            Principal principal) {
        
        TicketResponseDto updatedTicket = ticketService.updateTicketStatus(id, statusUpdateDto, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Ticket status updated successfully", updatedTicket));
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TicketResponseDto>> assignTicket(
            @PathVariable UUID id,
            @Valid @RequestBody TicketAssignDto assignDto,
            Principal principal) {
        
        TicketResponseDto assignedTicket = ticketService.assignTicket(id, assignDto, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Ticket assigned successfully", assignedTicket));
    }

    @PatchMapping("/{id}/comments/{commentId}")
    public ResponseEntity<ApiResponse<CommentDto>> updateComment(
            @PathVariable UUID id,
            @PathVariable UUID commentId,
            @Valid @RequestBody CommentUpdateDto commentUpdateDto,
            Principal principal) {
        
        CommentDto updatedComment = ticketService.updateComment(id, commentId, commentUpdateDto, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Comment updated successfully", updatedComment));
    }

    @DeleteMapping("/{id}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable UUID id,
            @PathVariable UUID commentId,
            Principal principal) {
        
        ticketService.deleteComment(id, commentId, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
