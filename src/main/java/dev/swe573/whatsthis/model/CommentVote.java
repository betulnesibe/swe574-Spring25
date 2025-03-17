package dev.swe573.whatsthis.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "comment_votes", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "comment_id"}))
@Data
@NoArgsConstructor
public class CommentVote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "comment_id", nullable = false)
    private Long commentId;
    
    @Column(nullable = false)
    private Boolean isUpvote;
} 