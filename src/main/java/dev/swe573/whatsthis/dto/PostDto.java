package dev.swe573.whatsthis.dto;

import lombok.Data;

import java.util.List;
import java.time.LocalDateTime;

@Data
public class PostDto {
    private Long id;
    private String title;
    private String description;
    private int votes;
    private Long userId;

    private List<String> tags;
    private List<String> imageUrls;

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

    private List<CommentDto> comments;
    private List<PartDto> parts;

    private Long solutionCommentId;
    private boolean isSolved;

    private LocalDateTime createdAt;

}
