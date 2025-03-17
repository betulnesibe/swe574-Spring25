package dev.swe573.whatsthis.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;
import java.util.Date;

@Data
public class CommentDto {

    private Long id;
    private String text;
    private int votes;

    private Long userId;
    private String username;

    private Long postId;

    private Long parentCommentId;
    private List<String> imageUrls = new ArrayList<>();
    
    // New fields for enhanced commenting
    private String commentType; // IDENTIFICATION, ADDITIONAL_INFO, CORRECTION, REQUEST_INFO
    private String confidenceLevel; // MAYBE, LIKELY, VERY_CONFIDENT
    private boolean isExpertOpinion;
    private Date createdAt;
    private List<String> referenceLinks = new ArrayList<>();
}
