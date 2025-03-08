package dev.swe573.whatsthis.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name="posts")
@Data
@NoArgsConstructor
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    //optional description
    private String material;
    private String size;
    private String textAndLanguage;
    private String color;
    private String shape;
    private String weight;
    private String price;
    private String location;
    private String timePeriod;
    private String smell;
    private String taste;
    private String texture;
    private String hardness;
    private String pattern;
    private String brand;
    private String print;
    private String icons;
    private Boolean handmade;
    private String functionality;

    private String widthValue;
    private String widthUnit;
    private String heightValue;
    private String heightUnit;
    private String depthValue;
    private String depthUnit;

    private int votes = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @ElementCollection
    @CollectionTable(name = "post_tags", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "tag")
    private List<String> tags;


    @ElementCollection
    @CollectionTable(name = "post_images", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "image_url")
    private List<String> imageUrls;

    //maybe we can add videos too



//    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
//    private List<Comment> comments = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "post_parts", joinColumns = @JoinColumn(name = "post_id"))
    private List<Part> parts = new ArrayList<>();

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean isSolved = false;

    @Column(nullable = true)
    private Long solutionCommentId;
}
