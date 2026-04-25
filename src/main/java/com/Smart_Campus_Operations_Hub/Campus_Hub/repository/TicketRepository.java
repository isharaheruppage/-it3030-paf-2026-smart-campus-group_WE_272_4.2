package com.Smart_Campus_Operations_Hub.Campus_Hub.repository;

import com.Smart_Campus_Operations_Hub.Campus_Hub.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByCreatedById(Long userId);
    List<Ticket> findByAssignedToId(Long userId);
    List<Ticket> findByStatus(Ticket.Status status);
    List<Ticket> findByCreatedByIdOrAssignedToId(Long createdById, Long assignedToId);

    @Query("SELECT t FROM Ticket t WHERE t.createdBy.id = :userId OR t.assignedTo.id = :userId")
    List<Ticket> findTicketsByUser(@Param("userId") Long userId);
}
