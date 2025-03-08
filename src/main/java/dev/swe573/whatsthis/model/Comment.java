package dev.swe573.whatsthis.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name="comments")
@Data
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(name = "post_id", nullable = false)
    private Long postId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "username", nullable = false)
    private String username;


    @Column(columnDefinition = "text")
    String text;


    @ManyToOne
    @JoinColumn(name = "parent_comment_id")
    private Comment parentComment;


    @ElementCollection
    @CollectionTable(name = "comment_images", joinColumns = @JoinColumn(name = "comment_id"))
    @Column(name = "image_url")
    private List<String> imageUrls = new ArrayList<>();

    private int votes = 0;
}
