package dev.swe573.whatsthis.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.hibernate.annotations.CreationTimestamp;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

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

    // Remove the @ElementCollection for imageUrls
    // Instead, store them in a simple List and handle conversion
    @Column(name = "image_urls", columnDefinition = "text")
    private String imageUrlsString;
    
    @Transient
    private List<String> imageUrls = new ArrayList<>();
    
    // Add methods to convert between string and list
    public List<String> getImageUrls() {
        if (imageUrlsString == null || imageUrlsString.isEmpty()) {
            return new ArrayList<>();
        }
        return Arrays.asList(imageUrlsString.split("\\|\\|"));
    }
    
    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls != null ? new ArrayList<>(imageUrls) : new ArrayList<>();
        this.imageUrlsString = imageUrls != null && !imageUrls.isEmpty() 
            ? String.join("||", imageUrls) 
            : "";
    }

    private int votes = 0;
    
    // New fields for enhanced commenting
    @Column(name = "comment_type")
    private String commentType; // IDENTIFICATION, ADDITIONAL_INFO, CORRECTION, REQUEST_INFO
    
    @Column(name = "confidence_level")
    private String confidenceLevel; // MAYBE, LIKELY, VERY_CONFIDENT
    
    @Column(name = "is_expert_opinion")
    private boolean isExpertOpinion = false;
    
    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created_at")
    private Date createdAt;
    
    @ElementCollection
    @CollectionTable(name = "comment_references", joinColumns = @JoinColumn(name = "comment_id"))
    @Column(name = "reference_link")
    private List<String> referenceLinks = new ArrayList<>();
}
