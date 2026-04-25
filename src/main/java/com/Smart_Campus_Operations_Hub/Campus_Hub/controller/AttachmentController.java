package com.Smart_Campus_Operations_Hub.Campus_Hub.controller;

import com.Smart_Campus_Operations_Hub.Campus_Hub.entity.IncidentStatus;
import com.Smart_Campus_Operations_Hub.Campus_Hub.entity.TicketAttachment;
import com.Smart_Campus_Operations_Hub.Campus_Hub.repository.TicketAttachmentRepository;
import com.Smart_Campus_Operations_Hub.Campus_Hub.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.InputStream;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tickets/{ticketId}/attachments")
@RequiredArgsConstructor
public class AttachmentController {

    private final FileStorageService fileStorageService;
    private final TicketAttachmentRepository attachmentRepository;

    @GetMapping("/{attachmentId}/download")
    public ResponseEntity<StreamingResponseBody> downloadAttachment(
            @PathVariable UUID ticketId,
            @PathVariable UUID attachmentId,
            Authentication authentication) {

        TicketAttachment attachment = attachmentRepository.findByIdAndTicketId(attachmentId, ticketId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));

        String userEmail = authentication.getName();
        boolean isAdminOrTech = authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN")) ||
                                authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_TECHNICIAN"));
        
        boolean isOwner = attachment.getTicket().getReportedBy().equals(userEmail);
        boolean isAssignedTech = userEmail.equals(attachment.getTicket().getAssignedTechnicianId());

        if (!isAdminOrTech && !isOwner && !isAssignedTech) {
            throw new AccessDeniedException("Access denied");
        }

        UrlResource resource = fileStorageService.loadFileAsResource(attachment.getStoredFileName(), ticketId);

        StreamingResponseBody responseBody = outputStream -> {
            try (InputStream inputStream = resource.getInputStream()) {
                inputStream.transferTo(outputStream);
            }
        };

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + attachment.getFileName() + "\"")
                .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(attachment.getFileSize()))
                .contentType(MediaType.parseMediaType(attachment.getFileType() != null ? attachment.getFileType() : "application/octet-stream"))
                .body(responseBody);
    }

    @DeleteMapping("/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable UUID ticketId,
            @PathVariable UUID attachmentId,
            Authentication authentication) {

        TicketAttachment attachment = attachmentRepository.findByIdAndTicketId(attachmentId, ticketId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));

        String userEmail = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
        boolean isOwner = attachment.getTicket().getReportedBy().equals(userEmail);

        if (!isAdmin && !(isOwner && attachment.getTicket().getStatus() == IncidentStatus.OPEN)) {
            throw new AccessDeniedException("Cannot delete attachment");
        }

        fileStorageService.deleteAttachment(attachment.getStoredFileName(), ticketId, userEmail);
        attachmentRepository.delete(attachment);

        return ResponseEntity.noContent().build();
    }
}
