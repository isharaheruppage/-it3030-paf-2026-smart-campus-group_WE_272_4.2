package com.Smart_Campus_Operations_Hub.Campus_Hub.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "incident_tickets")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidentTicket extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank(message = "Title must not be blank")
    @Size(max = 255)
    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IncidentCategory category;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IncidentPriority priority;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IncidentStatus status;

    private UUID resourceId;

    private String resourceLocation;

    private String preferredContactName;

    private String preferredContactPhone;

    private String reportedBy;

    private String assignedTechnicianId;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(columnDefinition = "TEXT")
    private String resolutionNotes;

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TicketAttachment> attachments = new ArrayList<>();

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TicketComment> comments = new ArrayList<>();

    public void addAttachment(TicketAttachment attachment) {
        attachments.add(attachment);
        attachment.setTicket(this);
    }

    public void removeAttachment(TicketAttachment attachment) {
        attachments.remove(attachment);
        attachment.setTicket(null);
    }

    public void addComment(TicketComment comment) {
        comments.add(comment);
        comment.setTicket(this);
    }

    public void removeComment(TicketComment comment) {
        comments.remove(comment);
        comment.setTicket(null);
    }
}
