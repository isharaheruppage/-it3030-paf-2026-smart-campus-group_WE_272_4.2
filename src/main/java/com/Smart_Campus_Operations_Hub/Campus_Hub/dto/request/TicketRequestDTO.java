package com.Smart_Campus_Operations_Hub.Campus_Hub.dto.request;

import com.Smart_Campus_Operations_Hub.Campus_Hub.model.Ticket;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
public class TicketRequestDTO {
    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @NotNull(message = "Category is required")
    private Ticket.Category category;

    @NotNull(message = "Priority is required")
    private Ticket.Priority priority;

    private Long resourceId;
    private String location;

    @Size(max = 500, message = "Contact details must not exceed 500 characters")
    private String contactDetails;

    // For file uploads, handled separately in controller
    private List<MultipartFile> attachments;
}
