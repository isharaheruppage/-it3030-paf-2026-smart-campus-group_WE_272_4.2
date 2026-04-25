package com.Smart_Campus_Operations_Hub.Campus_Hub.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ticket_attachments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    @ToString.Exclude
    private IncidentTicket ticket;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String storedFileName;

    private String fileType;

    private Long fileSize;

    private String uploadedBy;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime uploadedAt;
}
