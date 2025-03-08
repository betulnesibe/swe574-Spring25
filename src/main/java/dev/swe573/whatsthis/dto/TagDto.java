package dev.swe573.whatsthis.dto;

import lombok.Data;

@Data
public class TagDto {
    private String id;
    private String label;
    private String description;
    private String wikiUrl;
    private String wikipediaUrl;

    public TagDto (String id, String label, String description, String wikiUrl, String wikipediaUrl) {
        this.id = id;
        this.label = label;
        this.description = description;
        this.wikiUrl = wikiUrl;
        this.wikipediaUrl = wikipediaUrl;
    }

}
