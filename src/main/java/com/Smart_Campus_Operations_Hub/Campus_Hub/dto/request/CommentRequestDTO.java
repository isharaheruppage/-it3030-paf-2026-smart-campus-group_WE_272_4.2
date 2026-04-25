package com.Smart_Campus_Operations_Hub.Campus_Hub.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CommentRequestDTO {
    @NotNull(message = "Ticket ID is required")
    private Long ticketId;

    @NotBlank(message = "Content is required")
    @Size(max = 500, message = "Content must not exceed 500 characters")
    private String content;
}