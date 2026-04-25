package com.Smart_Campus_Operations_Hub.Campus_Hub.controller;

import com.Smart_Campus_Operations_Hub.Campus_Hub.dto.request.CommentRequestDTO;
import com.Smart_Campus_Operations_Hub.Campus_Hub.dto.response.CommentResponseDTO;
import com.Smart_Campus_Operations_Hub.Campus_Hub.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    public ResponseEntity<CommentResponseDTO> addComment(
            @Valid @RequestBody CommentRequestDTO request,
            @RequestHeader("User-Id") Long userId) {
        CommentResponseDTO comment = commentService.addComment(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(comment);
    }

    @GetMapping("/ticket/{ticketId}")
    public ResponseEntity<List<CommentResponseDTO>> getCommentsByTicket(@PathVariable Long ticketId) {
        List<CommentResponseDTO> comments = commentService.getCommentsByTicket(ticketId);
        return ResponseEntity.ok(comments);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CommentResponseDTO> updateComment(
            @PathVariable Long id,
            @RequestParam String content,
            @RequestHeader("User-Id") Long userId) {
        CommentResponseDTO comment = commentService.updateComment(id, content, userId);
        return ResponseEntity.ok(comment);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id, @RequestHeader("User-Id") Long userId) {
        commentService.deleteComment(id, userId);
        return ResponseEntity.noContent().build();
    }
}