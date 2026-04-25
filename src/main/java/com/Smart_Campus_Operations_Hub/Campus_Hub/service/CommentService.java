package com.Smart_Campus_Operations_Hub.Campus_Hub.service;

import com.Smart_Campus_Operations_Hub.Campus_Hub.dto.request.CommentRequestDTO;
import com.Smart_Campus_Operations_Hub.Campus_Hub.dto.response.CommentResponseDTO;
import com.Smart_Campus_Operations_Hub.Campus_Hub.model.Comment;
import com.Smart_Campus_Operations_Hub.Campus_Hub.model.Ticket;
import com.Smart_Campus_Operations_Hub.Campus_Hub.model.User;
import com.Smart_Campus_Operations_Hub.Campus_Hub.repository.CommentRepository;
import com.Smart_Campus_Operations_Hub.Campus_Hub.repository.TicketRepository;
import com.Smart_Campus_Operations_Hub.Campus_Hub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    @Transactional
    public CommentResponseDTO addComment(CommentRequestDTO request, Long userId) {
        Ticket ticket = ticketRepository.findById(request.getTicketId())
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        User author = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = new Comment();
        comment.setTicket(ticket);
        comment.setAuthor(author);
        comment.setContent(request.getContent());

        Comment savedComment = commentRepository.save(comment);
        return mapToResponseDTO(savedComment);
    }

    public List<CommentResponseDTO> getCommentsByTicket(Long ticketId) {
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CommentResponseDTO updateComment(Long commentId, String newContent, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        // Only author can edit their comment
        if (!comment.getAuthor().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to edit comment");
        }

        comment.setContent(newContent);
        comment.setIsEdited(true);

        Comment updatedComment = commentRepository.save(comment);
        return mapToResponseDTO(updatedComment);
    }

    @Transactional
    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        // Only author or admin can delete
        if (!comment.getAuthor().getId().equals(userId)) {
            User currentUser = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            if (currentUser.getRole() != User.Role.ADMIN) {
                throw new RuntimeException("Unauthorized to delete comment");
            }
        }

        commentRepository.delete(comment);
    }

    private CommentResponseDTO mapToResponseDTO(Comment comment) {
        CommentResponseDTO dto = new CommentResponseDTO();
        dto.setId(comment.getId());
        dto.setTicketId(comment.getTicket().getId());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setIsEdited(comment.getIsEdited());

        CommentResponseDTO.UserSummaryDTO author = new CommentResponseDTO.UserSummaryDTO();
        author.setId(comment.getAuthor().getId());
        author.setUsername(comment.getAuthor().getUsername());
        author.setFirstName(comment.getAuthor().getFirstName());
        author.setLastName(comment.getAuthor().getLastName());
        dto.setAuthor(author);

        return dto;
    }
}