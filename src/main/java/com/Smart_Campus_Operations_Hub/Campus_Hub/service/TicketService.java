package com.Smart_Campus_Operations_Hub.Campus_Hub.service;

import com.Smart_Campus_Operations_Hub.Campus_Hub.dto.request.TicketRequestDTO;
import com.Smart_Campus_Operations_Hub.Campus_Hub.dto.response.TicketResponseDTO;
import com.Smart_Campus_Operations_Hub.Campus_Hub.model.Ticket;
import com.Smart_Campus_Operations_Hub.Campus_Hub.model.User;
import com.Smart_Campus_Operations_Hub.Campus_Hub.model.Resource;
import com.Smart_Campus_Operations_Hub.Campus_Hub.repository.TicketRepository;
import com.Smart_Campus_Operations_Hub.Campus_Hub.repository.UserRepository;
import com.Smart_Campus_Operations_Hub.Campus_Hub.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;

    private static final String UPLOAD_DIR = "uploads/tickets/";

    @Transactional
    public TicketResponseDTO createTicket(TicketRequestDTO request, Long userId, List<MultipartFile> attachments) {
        User createdBy = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Ticket ticket = new Ticket();
        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setCategory(request.getCategory());
        ticket.setPriority(request.getPriority());
        ticket.setCreatedBy(createdBy);
        ticket.setLocation(request.getLocation());
        ticket.setContactDetails(request.getContactDetails());

        if (request.getResourceId() != null) {
            Resource resource = resourceRepository.findById(request.getResourceId())
                    .orElseThrow(() -> new RuntimeException("Resource not found"));
            ticket.setResource(resource);
        }

        Ticket savedTicket = ticketRepository.save(ticket);

        // Handle file uploads
        if (attachments != null && !attachments.isEmpty()) {
            List<String> attachmentPaths = saveAttachments(attachments, savedTicket.getId());
            savedTicket.setAttachments(attachmentPaths);
            savedTicket = ticketRepository.save(savedTicket);
        }

        return mapToResponseDTO(savedTicket);
    }

    public List<TicketResponseDTO> getAllTickets() {
        return ticketRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public List<TicketResponseDTO> getTicketsByUser(Long userId) {
        return ticketRepository.findTicketsByUser(userId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public TicketResponseDTO getTicketById(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        return mapToResponseDTO(ticket);
    }

    @Transactional
    public TicketResponseDTO updateTicketStatus(Long id, Ticket.Status status, Long userId) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        boolean isAssignedUser = ticket.getAssignedTo() != null && ticket.getAssignedTo().getId().equals(userId);
        boolean isCreator = ticket.getCreatedBy() != null && ticket.getCreatedBy().getId().equals(userId);

        if (!isAssignedUser && !isCreator) {
            throw new RuntimeException("Unauthorized to update ticket status");
        }

        ticket.setStatus(status);
        if (status == Ticket.Status.RESOLVED || status == Ticket.Status.CLOSED) {
            ticket.setResolvedAt(LocalDateTime.now());
        }

        Ticket updatedTicket = ticketRepository.save(ticket);
        return mapToResponseDTO(updatedTicket);
    }

    @Transactional
    public TicketResponseDTO assignTicket(Long id, Long assignedToId, Long userId) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        User assignedTo = userRepository.findById(assignedToId)
                .orElseThrow(() -> new RuntimeException("Assigned user not found"));

        // Only admin can assign tickets
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        if (currentUser.getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Only admins can assign tickets");
        }

        ticket.setAssignedTo(assignedTo);
        ticket.setStatus(Ticket.Status.IN_PROGRESS);

        Ticket updatedTicket = ticketRepository.save(ticket);
        return mapToResponseDTO(updatedTicket);
    }

    @Transactional
    public void deleteTicket(Long id, Long userId) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        // Only creator or admin can delete
        if (!ticket.getCreatedBy().getId().equals(userId)) {
            User currentUser = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            if (currentUser.getRole() != User.Role.ADMIN) {
                throw new RuntimeException("Unauthorized to delete ticket");
            }
        }

        // Delete attachment files
        if (ticket.getAttachments() != null) {
            for (String path : ticket.getAttachments()) {
                try {
                    Files.deleteIfExists(Paths.get(path));
                } catch (IOException e) {
                    // Log error but continue
                }
            }
        }

        ticketRepository.delete(ticket);
    }

    private List<String> saveAttachments(List<MultipartFile> files, Long ticketId) {
        List<String> paths = new ArrayList<>();
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            for (int i = 0; i < Math.min(files.size(), 3); i++) { // Max 3 attachments
                MultipartFile file = files.get(i);
                if (!file.isEmpty()) {
                    String filename = ticketId + "_" + i + "_" + file.getOriginalFilename();
                    Path filePath = uploadPath.resolve(filename);
                    Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                    paths.add(UPLOAD_DIR + filename);
                }
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to save attachments", e);
        }
        return paths;
    }

    private TicketResponseDTO mapToResponseDTO(Ticket ticket) {
        TicketResponseDTO dto = new TicketResponseDTO();
        dto.setId(ticket.getId());
        dto.setTitle(ticket.getTitle());
        dto.setDescription(ticket.getDescription());
        dto.setCategory(ticket.getCategory());
        dto.setPriority(ticket.getPriority());
        dto.setStatus(ticket.getStatus());
        dto.setLocation(ticket.getLocation());
        dto.setContactDetails(ticket.getContactDetails());
        dto.setAttachments(ticket.getAttachments());
        dto.setCreatedAt(ticket.getCreatedAt());
        dto.setUpdatedAt(ticket.getUpdatedAt());
        dto.setResolvedAt(ticket.getResolvedAt());

        if (ticket.getCreatedBy() != null) {
            TicketResponseDTO.UserSummaryDTO createdBy = new TicketResponseDTO.UserSummaryDTO();
            createdBy.setId(ticket.getCreatedBy().getId());
            createdBy.setUsername(ticket.getCreatedBy().getUsername());
            createdBy.setFirstName(ticket.getCreatedBy().getFirstName());
            createdBy.setLastName(ticket.getCreatedBy().getLastName());
            createdBy.setEmail(ticket.getCreatedBy().getEmail());
            dto.setCreatedBy(createdBy);
        }

        if (ticket.getAssignedTo() != null) {
            TicketResponseDTO.UserSummaryDTO assignedTo = new TicketResponseDTO.UserSummaryDTO();
            assignedTo.setId(ticket.getAssignedTo().getId());
            assignedTo.setUsername(ticket.getAssignedTo().getUsername());
            assignedTo.setFirstName(ticket.getAssignedTo().getFirstName());
            assignedTo.setLastName(ticket.getAssignedTo().getLastName());
            assignedTo.setEmail(ticket.getAssignedTo().getEmail());
            dto.setAssignedTo(assignedTo);
        }

        if (ticket.getResource() != null) {
            TicketResponseDTO.ResourceSummaryDTO resource = new TicketResponseDTO.ResourceSummaryDTO();
            resource.setId(ticket.getResource().getId());
            resource.setName(ticket.getResource().getName());
            resource.setLocation(ticket.getResource().getLocation());
            dto.setResource(resource);
        }

        return dto;
    }
}
