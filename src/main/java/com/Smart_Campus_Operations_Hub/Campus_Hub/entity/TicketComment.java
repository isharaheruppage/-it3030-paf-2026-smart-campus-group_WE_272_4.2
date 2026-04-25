package com.Smart_Campus_Operations_Hub.Campus_Hub.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "ticket_comments")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketComment extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    @ToString.Exclude
    private IncidentTicket ticket;

    @NotBlank(message = "Content must not be blank")
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    private String authorEmail;

    private String authorRole;

    @Builder.Default
    @Column(nullable = false)
    private boolean isEdited = false;
}
