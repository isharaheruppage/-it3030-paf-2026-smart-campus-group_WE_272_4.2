package com.Smart_Campus_Operations_Hub.Campus_Hub.service;

import com.Smart_Campus_Operations_Hub.Campus_Hub.dto.*;
import com.Smart_Campus_Operations_Hub.Campus_Hub.entity.*;
import com.Smart_Campus_Operations_Hub.Campus_Hub.exception.*;
import com.Smart_Campus_Operations_Hub.Campus_Hub.repository.*;
import com.Smart_Campus_Operations_Hub.Campus_Hub.event.TicketStatusChangedEvent;
import com.Smart_Campus_Operations_Hub.Campus_Hub.machine.TicketStatusMachine;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private FileStorageService fileStorageService;

    @Mock
    private TicketStatusMachine statusMachine;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private TicketAuditLogRepository auditLogRepository;

    @InjectMocks
    private TicketService ticketService;

    private IncidentTicket sampleTicket;
    private UUID ticketId;
    private final String ownerEmail = "owner@example.com";
    private final String otherEmail = "other@example.com";
    private final String adminEmail = "admin@example.com";

    @BeforeEach
    void setUp() {
        ticketId = UUID.randomUUID();
        sampleTicket = IncidentTicket.builder()
                .id(ticketId)
                .title("Test Ticket")
                .description("Issue")
                .category(IncidentCategory.ELECTRICAL)
                .priority(IncidentPriority.HIGH)
                .status(IncidentStatus.OPEN)
                .reportedBy(ownerEmail)
                .attachments(new ArrayList<>())
                .comments(new ArrayList<>())
                .build();
    }

    // createTicket

    @Test
    void givenValidRequestWith2Attachments_whenCreate_thenSavedWithStatusOpen() {
        TicketCreateDto dto = new TicketCreateDto();
        dto.setTitle("New Issue");
        dto.setCategory(IncidentCategory.PLUMBING);
        dto.setPriority(IncidentPriority.MEDIUM);

        List<MultipartFile> files = List.of(
                new MockMultipartFile("file1", "test1.jpg", "image/jpeg", new byte[10]),
                new MockMultipartFile("file2", "test2.jpg", "image/jpeg", new byte[10])
        );

        when(ticketRepository.save(any(IncidentTicket.class))).thenAnswer(invocation -> {
            IncidentTicket saved = invocation.getArgument(0);
            saved.setId(ticketId);
            return saved;
        });

        when(fileStorageService.storeAttachments(eq(ticketId), eq(files), eq(0))).thenReturn(new ArrayList<>());

        TicketResponseDto result = ticketService.createTicket(dto, files, ownerEmail);

        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo(IncidentStatus.OPEN);
        verify(ticketRepository).save(any(IncidentTicket.class));
        verify(fileStorageService, times(1)).storeAttachments(eq(ticketId), eq(files), eq(0));
    }

    @Test
    void givenFourAttachments_whenCreate_thenThrowsAttachmentLimitExceededException() {
        TicketCreateDto dto = new TicketCreateDto();
        List<MultipartFile> files = List.of(
                new MockMultipartFile("f1", new byte[0]),
                new MockMultipartFile("f2", new byte[0]),
                new MockMultipartFile("f3", new byte[0]),
                new MockMultipartFile("f4", new byte[0])
        );

        assertThatThrownBy(() -> ticketService.createTicket(dto, files, ownerEmail))
                .isInstanceOf(AttachmentLimitExceededException.class);
    }

    // getTicketById

    @Test
    void givenOwnerUser_whenGetOwnTicket_thenReturnDto() {
        when(ticketRepository.findById(ticketId)).thenReturn(Optional.of(sampleTicket));

        TicketDetailDto result = ticketService.getTicketById(ticketId, ownerEmail);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(ticketId);
    }

    @Test
    void givenDifferentUser_whenGetOthersTicket_thenThrowsUnauthorizedTicketAccessException() {
        when(ticketRepository.findById(ticketId)).thenReturn(Optional.of(sampleTicket));

        assertThatThrownBy(() -> ticketService.getTicketById(ticketId, otherEmail))
                .isInstanceOf(UnauthorizedTicketAccessException.class);
    }

    @Test
    void givenAdminRole_whenGetAnyTicket_thenReturnDto() {
        when(ticketRepository.findById(ticketId)).thenReturn(Optional.of(sampleTicket));
        
        TicketDetailDto result = ticketService.getTicketById(ticketId, adminEmail);
        
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(ticketId);
    }

    @Test
    void givenUnknownId_whenGet_thenThrowsTicketNotFoundException() {
        when(ticketRepository.findById(ticketId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> ticketService.getTicketById(ticketId, ownerEmail))
                .isInstanceOf(TicketNotFoundException.class);
    }

    // updateTicketStatus

    @Test
    void givenOpenTicket_whenTransitionToInProgress_thenStatusUpdatedAndEventPublished() {
        when(ticketRepository.findById(ticketId)).thenReturn(Optional.of(sampleTicket));
        doNothing().when(statusMachine).validate(IncidentStatus.OPEN, IncidentStatus.IN_PROGRESS);

        TicketStatusUpdateDto dto = new TicketStatusUpdateDto();
        dto.setStatus(IncidentStatus.IN_PROGRESS);

        TicketResponseDto result = ticketService.updateTicketStatus(ticketId, dto, ownerEmail);

        assertThat(result.getStatus()).isEqualTo(IncidentStatus.IN_PROGRESS);
        verify(eventPublisher).publishEvent(any(TicketStatusChangedEvent.class));
        verify(auditLogRepository).save(any(TicketAuditLog.class));
    }

    @Test
    void givenOpenTicket_whenTransitionToClosed_thenThrowsTicketStatusTransitionException() {
        when(ticketRepository.findById(ticketId)).thenReturn(Optional.of(sampleTicket));
        doThrow(new TicketStatusTransitionException("Invalid transition"))
                .when(statusMachine).validate(IncidentStatus.OPEN, IncidentStatus.CLOSED);

        TicketStatusUpdateDto dto = new TicketStatusUpdateDto();
        dto.setStatus(IncidentStatus.CLOSED);

        assertThatThrownBy(() -> ticketService.updateTicketStatus(ticketId, dto, ownerEmail))
                .isInstanceOf(TicketStatusTransitionException.class);
    }

    @Test
    void givenRejectionWithoutReason_whenReject_thenThrowsIllegalArgumentException() {
        when(ticketRepository.findById(ticketId)).thenReturn(Optional.of(sampleTicket));

        TicketStatusUpdateDto dto = new TicketStatusUpdateDto();
        dto.setStatus(IncidentStatus.REJECTED);
        dto.setReason(""); // Blank reason

        assertThatThrownBy(() -> ticketService.updateTicketStatus(ticketId, dto, ownerEmail))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void givenClosedTicket_whenAnyTransition_thenThrowsTicketStatusTransitionException() {
        sampleTicket.setStatus(IncidentStatus.CLOSED);
        when(ticketRepository.findById(ticketId)).thenReturn(Optional.of(sampleTicket));
        doThrow(new TicketStatusTransitionException("Terminal state"))
                .when(statusMachine).assertNotTerminal(IncidentStatus.CLOSED);

        TicketStatusUpdateDto dto = new TicketStatusUpdateDto();
        dto.setStatus(IncidentStatus.OPEN);

        assertThatThrownBy(() -> ticketService.updateTicketStatus(ticketId, dto, ownerEmail))
                .isInstanceOf(TicketStatusTransitionException.class);
    }

    // addComment

    @Test
    void givenOwnerUser_whenAddComment_thenSavedWithAuthorEmail() {
        when(ticketRepository.findById(ticketId)).thenReturn(Optional.of(sampleTicket));
        
        CommentCreateDto dto = new CommentCreateDto();
        dto.setContent("Test comment");

        CommentDto result = ticketService.addComment(ticketId, dto, ownerEmail);

        assertThat(result).isNotNull();
        assertThat(result.getAuthorEmail()).isEqualTo(ownerEmail);
        assertThat(sampleTicket.getComments()).hasSize(1);
    }

    @Test
    void givenDifferentUser_whenCommentOnOthersTicket_thenThrowsUnauthorizedTicketAccessException() {
        when(ticketRepository.findById(ticketId)).thenReturn(Optional.of(sampleTicket));

        CommentCreateDto dto = new CommentCreateDto();
        dto.setContent("Test comment");

        assertThatThrownBy(() -> ticketService.addComment(ticketId, dto, otherEmail))
                .isInstanceOf(UnauthorizedTicketAccessException.class);
    }

    @Test
    void givenAdminRole_whenCommentOnAnyTicket_thenSuccess() {
        when(ticketRepository.findById(ticketId)).thenReturn(Optional.of(sampleTicket));

        CommentCreateDto dto = new CommentCreateDto();
        dto.setContent("Admin comment");

        CommentDto result = ticketService.addComment(ticketId, dto, adminEmail);

        assertThat(result).isNotNull();
        assertThat(result.getAuthorEmail()).isEqualTo(adminEmail);
    }

    // editComment

    @Test
    void givenOwner_whenEditComment_thenIsEditedTrueAndContentUpdated() {
        UUID commentId = UUID.randomUUID();
        TicketComment comment = TicketComment.builder()
                .id(commentId)
                .ticket(sampleTicket)
                .authorEmail(ownerEmail)
                .content("Original content")
                .isEdited(false)
                .build();
        sampleTicket.getComments().add(comment);

        when(ticketRepository.findById(ticketId)).thenReturn(Optional.of(sampleTicket));

        CommentUpdateDto dto = new CommentUpdateDto();
        dto.setContent("Updated content");

        CommentDto result = ticketService.updateComment(ticketId, commentId, dto, ownerEmail);

        assertThat(result.getContent()).isEqualTo("Updated content");
        assertThat(result.isEdited()).isTrue();
    }

    @Test
    void givenNonOwner_whenEditComment_thenThrowsUnauthorizedTicketAccessException() {
        UUID commentId = UUID.randomUUID();
        TicketComment comment = TicketComment.builder()
                .id(commentId)
                .ticket(sampleTicket)
                .authorEmail(ownerEmail)
                .content("Original content")
                .build();
        sampleTicket.getComments().add(comment);

        when(ticketRepository.findById(ticketId)).thenReturn(Optional.of(sampleTicket));

        CommentUpdateDto dto = new CommentUpdateDto();
        dto.setContent("Updated");

        assertThatThrownBy(() -> ticketService.updateComment(ticketId, commentId, dto, otherEmail))
                .isInstanceOf(UnauthorizedTicketAccessException.class);
    }

    // deleteComment

    @Test
    void givenOwner_whenDeleteOwnComment_thenRemoved() {
        UUID commentId = UUID.randomUUID();
        TicketComment comment = TicketComment.builder()
                .id(commentId)
                .ticket(sampleTicket)
                .authorEmail(ownerEmail)
                .build();
        sampleTicket.getComments().add(comment);

        when(ticketRepository.findById(ticketId)).thenReturn(Optional.of(sampleTicket));

        ticketService.deleteComment(ticketId, commentId, ownerEmail);

        assertThat(sampleTicket.getComments()).isEmpty();
    }

    @Test
    void givenAdmin_whenDeleteAnyComment_thenRemoved() {
        UUID commentId = UUID.randomUUID();
        TicketComment comment = TicketComment.builder()
                .id(commentId)
                .ticket(sampleTicket)
                .authorEmail(ownerEmail)
                .build();
        sampleTicket.getComments().add(comment);

        when(ticketRepository.findById(ticketId)).thenReturn(Optional.of(sampleTicket));

        ticketService.deleteComment(ticketId, commentId, adminEmail);

        assertThat(sampleTicket.getComments()).isEmpty();
    }

    @Test
    void givenOtherUser_whenDeleteComment_thenThrowsUnauthorizedTicketAccessException() {
        UUID commentId = UUID.randomUUID();
        TicketComment comment = TicketComment.builder()
                .id(commentId)
                .ticket(sampleTicket)
                .authorEmail(ownerEmail)
                .build();
        sampleTicket.getComments().add(comment);

        when(ticketRepository.findById(ticketId)).thenReturn(Optional.of(sampleTicket));

        assertThatThrownBy(() -> ticketService.deleteComment(ticketId, commentId, otherEmail))
                .isInstanceOf(UnauthorizedTicketAccessException.class);
    }

    // resolveTicket

    @Test
    void givenValidResolutionNotes_whenResolve_thenStatusResolvedAndNotesSaved() {
        when(ticketRepository.findById(ticketId)).thenReturn(Optional.of(sampleTicket));
        doNothing().when(statusMachine).validate(IncidentStatus.OPEN, IncidentStatus.RESOLVED);

        TicketStatusUpdateDto dto = new TicketStatusUpdateDto();
        dto.setStatus(IncidentStatus.RESOLVED);
        dto.setReason("Fixed the wiring issue.");

        TicketResponseDto result = ticketService.updateTicketStatus(ticketId, dto, ownerEmail);

        assertThat(result.getStatus()).isEqualTo(IncidentStatus.RESOLVED);
        assertThat(sampleTicket.getResolutionNotes()).isEqualTo("Fixed the wiring issue.");
    }

    @Test
    void givenBlankResolutionNotes_whenResolve_thenThrowsIllegalArgumentException() {
        when(ticketRepository.findById(ticketId)).thenReturn(Optional.of(sampleTicket));

        TicketStatusUpdateDto dto = new TicketStatusUpdateDto();
        dto.setStatus(IncidentStatus.RESOLVED);
        dto.setReason("   ");

        assertThatThrownBy(() -> ticketService.updateTicketStatus(ticketId, dto, ownerEmail))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
