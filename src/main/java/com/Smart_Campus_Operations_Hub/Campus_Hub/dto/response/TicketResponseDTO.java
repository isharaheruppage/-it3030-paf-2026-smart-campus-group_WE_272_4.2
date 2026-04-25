package com.Smart_Campus_Operations_Hub.Campus_Hub.dto.response;

import com.Smart_Campus_Operations_Hub.Campus_Hub.model.Ticket;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class TicketResponseDTO {
    private Long id;
    private String title;
    private String description;
    private Ticket.Category category;
    private Ticket.Priority priority;
    private Ticket.Status status;
    private UserSummaryDTO createdBy;
    private UserSummaryDTO assignedTo;
    private ResourceSummaryDTO resource;
    private String location;
    private String contactDetails;
    private List<String> attachments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;

    @Data
    public static class UserSummaryDTO {
        private Long id;
        private String username;
        private String firstName;
        private String lastName;
        private String email;
    }

    @Data
    public static class ResourceSummaryDTO {
        private Long id;
        private String name;
        private String location;
    }
}
