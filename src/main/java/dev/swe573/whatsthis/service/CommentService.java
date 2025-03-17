package dev.swe573.whatsthis.service;

import dev.swe573.whatsthis.controller.CommentNotFoundException;
import dev.swe573.whatsthis.controller.PostNotFoundException;
import dev.swe573.whatsthis.controller.UserNotFoundException;
import dev.swe573.whatsthis.dto.CommentDto;
import dev.swe573.whatsthis.model.Comment;
import dev.swe573.whatsthis.model.CommentVote;
import dev.swe573.whatsthis.model.Post;
import dev.swe573.whatsthis.model.User;
import dev.swe573.whatsthis.repository.CommentRepo;
import dev.swe573.whatsthis.repository.CommentVoteRepo;
import dev.swe573.whatsthis.repository.PostRepo;
import dev.swe573.whatsthis.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CommentService {

    @Autowired
    private CommentRepo commentRepo;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private PostRepo postRepo;

    @Autowired
    private CommentVoteRepo commentVoteRepo;

    @Transactional
    public CommentDto newComment(CommentDto commentDto) {
        try {
            // Create new comment
            Comment comment = new Comment();
            comment.setText(commentDto.getText());
            comment.setVotes(0);
            comment.setUsername(commentDto.getUsername());
            comment.setUserId(commentDto.getUserId());
            comment.setPostId(commentDto.getPostId());
            
            // Set new enhanced comment fields
            comment.setCommentType(commentDto.getCommentType());
            comment.setConfidenceLevel(commentDto.getConfidenceLevel());
            comment.setExpertOpinion(commentDto.isExpertOpinion());
            
            // Handle reference links
            if (commentDto.getReferenceLinks() != null && !commentDto.getReferenceLinks().isEmpty()) {
                comment.setReferenceLinks(new ArrayList<>(commentDto.getReferenceLinks()));
            } else {
                comment.setReferenceLinks(new ArrayList<>());
            }
            
            // Handle parent comment
            if (commentDto.getParentCommentId() != null) {
                Comment parentComment = commentRepo.findById(commentDto.getParentCommentId())
                        .orElseThrow(() -> new CommentNotFoundException(commentDto.getParentCommentId()));
                comment.setParentComment(parentComment);
            }

            // Process and set image URLs
            if (commentDto.getImageUrls() != null && !commentDto.getImageUrls().isEmpty()) {
                // Extract just the filenames for storage
                List<String> processedUrls = commentDto.getImageUrls().stream()
                        .map(url -> {
                            // Extract just the filename from any URL format
                            int lastSlash = url.lastIndexOf('/');
                            return lastSlash >= 0 ? url.substring(lastSlash + 1) : url;
                        })
                        .collect(Collectors.toList());
                
                // For debugging the file paths
                System.out.println("Original image URLs: " + commentDto.getImageUrls());
                System.out.println("Processed image filenames: " + processedUrls);
                
                // Store the processed URLs
                comment.setImageUrls(processedUrls);
            } else {
                comment.setImageUrls(new ArrayList<>());
            }

            // Save the comment in a single transaction
            Comment savedComment = commentRepo.save(comment);
            System.out.println("Comment saved with ID: " + savedComment.getId() + 
                              ", Images: " + savedComment.getImageUrls().size());
            
            // Convert to DTO and return
            return toDto(savedComment);
        } catch (Exception e) {
            System.err.println("Error creating comment: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public CommentDto toDto(Comment comment) {
        CommentDto commentDTO = new CommentDto();
        commentDTO.setId(comment.getId());
        commentDTO.setText(comment.getText());
        commentDTO.setVotes(comment.getVotes());
        commentDTO.setUserId(comment.getUserId());
        commentDTO.setPostId(comment.getPostId());
        commentDTO.setUsername(comment.getUsername());
        commentDTO.setParentCommentId(comment.getParentComment() != null ? comment.getParentComment().getId() : null);
        
        // Format image URLs for frontend
        List<String> imageUrls = comment.getImageUrls();
        if (imageUrls != null && !imageUrls.isEmpty()) {
            // Simply return filenames - the frontend will handle the full URL construction
            // This avoids any path inconsistencies between server and client
            List<String> formattedUrls = imageUrls.stream()
                    .map(filename -> {
                        // Strip any path info, just keep the filename
                        int lastSlash = filename.lastIndexOf('/');
                        String cleanFilename = lastSlash >= 0 ? filename.substring(lastSlash + 1) : filename;
                        
                        // Return just the filename - frontend will build the full URL
                        return cleanFilename;
                    })
                    .collect(Collectors.toList());
            
            System.out.println("Returning image filenames to frontend: " + formattedUrls);
            commentDTO.setImageUrls(formattedUrls);
        } else {
            commentDTO.setImageUrls(new ArrayList<>());
        }
        
        // Map new fields
        commentDTO.setCommentType(comment.getCommentType());
        commentDTO.setConfidenceLevel(comment.getConfidenceLevel());
        commentDTO.setExpertOpinion(comment.isExpertOpinion());
        commentDTO.setCreatedAt(comment.getCreatedAt());
        commentDTO.setReferenceLinks(comment.getReferenceLinks() != null ? 
                new ArrayList<>(comment.getReferenceLinks()) : new ArrayList<>());
        
        return commentDTO;
    }

    public Comment toEntity(CommentDto commentDto) {
        Comment comment = new Comment();
        comment.setText(commentDto.getText());
        comment.setVotes(commentDto.getVotes());
        comment.setUsername(commentDto.getUsername());
        comment.setUserId(commentDto.getUserId());
        comment.setPostId(commentDto.getPostId());
        comment.setImageUrls(commentDto.getImageUrls());
        
        // Map new fields
        comment.setCommentType(commentDto.getCommentType());
        comment.setConfidenceLevel(commentDto.getConfidenceLevel());
        comment.setExpertOpinion(commentDto.isExpertOpinion());
        // createdAt is handled by @CreationTimestamp
        
        if (commentDto.getReferenceLinks() != null) {
            comment.setReferenceLinks(new ArrayList<>(commentDto.getReferenceLinks()));
        }

        return comment;
    }

    public List<CommentDto> getCommentsByPostId(Long postId) {
        return commentRepo.findByPostId(postId).stream()
                .map(comment -> {
                    CommentDto commentDto = toDto(comment);
                    commentDto.setUsername(userRepo.findById(comment.getUserId())
                            .map(User::getUsername).orElse("Unknown"));
                    return commentDto;
                })
                .collect(Collectors.toList());
    }

    public CommentDto getCommentById(Long commentId){
        Comment comment = commentRepo.findById(commentId)
                .orElseThrow(() -> new CommentNotFoundException(commentId));

        return toDto(comment);
    }

    public void deleteComment(Long commentId) {
        Comment comment = commentRepo.findById(commentId)
                .orElseThrow(() -> new CommentNotFoundException(commentId));
        commentRepo.delete(comment);
    }

    public CommentDto upvoteComment(Long commentId) {
        return upvoteComment(commentId, null);
    }

    public CommentDto downvoteComment(Long commentId) {
        return downvoteComment(commentId, null);
    }

    public CommentDto upvoteComment(Long commentId, Long userId) {
        if (userId == null) {
            Comment comment = commentRepo.findById(commentId)
                    .orElseThrow(() -> new CommentNotFoundException(commentId));
            comment.setVotes(comment.getVotes() + 1);
            comment = commentRepo.save(comment);
            return toDto(comment);
        }
        
        return voteComment(commentId, userId, true);
    }

    public CommentDto downvoteComment(Long commentId, Long userId) {
        if (userId == null) {
            Comment comment = commentRepo.findById(commentId)
                    .orElseThrow(() -> new CommentNotFoundException(commentId));
            comment.setVotes(comment.getVotes() - 1);
            comment = commentRepo.save(comment);
            return toDto(comment);
        }
        
        return voteComment(commentId, userId, false);
    }

    @Transactional
    public CommentDto voteComment(Long commentId, Long userId, boolean isUpvote) {
        Optional<CommentVote> existingVote = commentVoteRepo.findByUserIdAndCommentId(userId, commentId);
        
        Comment comment = commentRepo.findById(commentId)
                .orElseThrow(() -> new CommentNotFoundException(commentId));
        
        if (existingVote.isPresent()) {
            CommentVote vote = existingVote.get();
            if (vote.getIsUpvote() == isUpvote) {
                commentVoteRepo.delete(vote);
                comment.setVotes(isUpvote ? comment.getVotes() - 1 : comment.getVotes() + 1);
            } else {
                vote.setIsUpvote(isUpvote);
                commentVoteRepo.save(vote);
                comment.setVotes(isUpvote ? comment.getVotes() + 2 : comment.getVotes() - 2);
            }
        } else {
            CommentVote vote = new CommentVote();
            vote.setUserId(userId);
            vote.setCommentId(commentId);
            vote.setIsUpvote(isUpvote);
            commentVoteRepo.save(vote);
            comment.setVotes(isUpvote ? comment.getVotes() + 1 : comment.getVotes() - 1);
        }
        
        commentRepo.save(comment);
        return toDto(comment);
    }

    public List<CommentDto> getCommentsByUserId(Long userId) {
        // Verify user exists
        userRepo.findById(userId)
            .orElseThrow(() -> new UserNotFoundException(userId));

        List<Comment> comments = commentRepo.findByUserId(userId);
        
        return comments.stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

}
