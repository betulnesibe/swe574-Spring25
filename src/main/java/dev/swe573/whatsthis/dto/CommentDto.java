package dev.swe573.whatsthis.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

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
}
