package com.Smart_Campus_Operations_Hub.Campus_Hub.repository;

import com.Smart_Campus_Operations_Hub.Campus_Hub.entity.TicketAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TicketAttachmentRepository extends JpaRepository<TicketAttachment, UUID> {
    Optional<TicketAttachment> findByIdAndTicketId(UUID id, UUID ticketId);
}
