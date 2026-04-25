package com.Smart_Campus_Operations_Hub.Campus_Hub.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tickets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @NotNull(message = "Category is required")
    @Enumerated(EnumType.STRING)
    private Category category;

    @NotNull(message = "Priority is required")
    @Enumerated(EnumType.STRING)
    private Priority priority;

    @Enumerated(EnumType.STRING)
    private Status status = Status.OPEN;

    @NotNull(message = "Created by is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_id")
    private User assignedTo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resource_id")
    private Resource resource;

    private String location;

    private String contactDetails;

    @ElementCollection
    @CollectionTable(name = "ticket_attachments", joinColumns = @JoinColumn(name = "ticket_id"))
    @Column(name = "attachment_path")
    private List<String> attachments = new ArrayList<>();

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    private LocalDateTime resolvedAt;

    public enum Category {
        HARDWARE, SOFTWARE, MAINTENANCE, ELECTRICAL, PLUMBING, OTHER
    }

    public enum Priority {
        LOW, MEDIUM, HIGH, URGENT
    }

    public enum Status {
        OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
