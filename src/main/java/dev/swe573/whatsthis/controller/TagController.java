package dev.swe573.whatsthis.controller;

import dev.swe573.whatsthis.dto.TagDto;
import dev.swe573.whatsthis.service.TagService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("api/tags")
public class TagController {

    private final TagService tagService;

    public TagController(TagService tagService) {
        this.tagService = tagService;
    }

    @GetMapping("/search")
    public ResponseEntity<List<TagDto>> searchTags(@RequestParam String query) {
        List<TagDto> tags = tagService.searchTags(query);
        return ResponseEntity.ok(tags);
    }
}
