package com.Smart_Campus_Operations_Hub.Campus_Hub.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CommentResponseDTO {
    private Long id;
    private Long ticketId;
    private UserSummaryDTO author;
    private String content;
    private LocalDateTime createdAt;
    private Boolean isEdited;

    @Data
    public static class UserSummaryDTO {
        private Long id;
        private String username;
        private String firstName;
        private String lastName;
    }
}