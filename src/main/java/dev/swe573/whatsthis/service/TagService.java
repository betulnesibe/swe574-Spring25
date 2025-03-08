package dev.swe573.whatsthis.service;

import dev.swe573.whatsthis.dto.TagDto;
import dev.swe573.whatsthis.model.Wikidata;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;



@Service
public class TagService {

    private final RestTemplate restTemplate;

    @Autowired
    public TagService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public List<TagDto> searchTags(String query) {
        String searchUrl = "https://www.wikidata.org/w/api.php?action=wbsearchentities&search=" + query + "&language=en&format=json";

        ResponseEntity<Wikidata> response = restTemplate.getForEntity(searchUrl, Wikidata.class);

        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            return response.getBody().getSearch().stream().map(entity -> {
                String wikipediaUrl = getEnglishWikipediaUrl(entity.getId());
                return new TagDto(
                    entity.getId(),
                    entity.getLabel(),
                    entity.getDescription(),
                    entity.getWikiUrl(),
                    wikipediaUrl
                );
            }).collect(Collectors.toList());
        } else {
            throw new RuntimeException("Could not fetch data from Wikidata :(");
        }
    }

    private String getEnglishWikipediaUrl(String entityId) {
        try {
            String url = String.format(
                "https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=sitelinks&ids=%s&sitefilter=enwiki",
                entityId
            );

            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                Map<String, Object> entities = (Map<String, Object>) body.get("entities");
                Map<String, Object> entity = (Map<String, Object>) entities.get(entityId);
                
                if (entity != null && entity.containsKey("sitelinks")) {
                    Map<String, Object> sitelinks = (Map<String, Object>) entity.get("sitelinks");
                    if (sitelinks != null && sitelinks.containsKey("enwiki")) {
                        Map<String, String> enwiki = (Map<String, String>) sitelinks.get("enwiki");
                        String title = enwiki.get("title");
                        if (title != null) {
                            return "https://en.wikipedia.org/wiki/" + title.replace(" ", "_");
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error fetching Wikipedia URL for " + entityId + ": " + e.getMessage());
        }
        return null;
    }
}
