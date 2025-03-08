package dev.swe573.whatsthis.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
public class Part {
    private String partName;
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
} 