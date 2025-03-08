package dev.swe573.whatsthis.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class Wikidata {

    private List<WikidataEntity> search;

    @Data
    public static class WikidataEntity {
        private String id;
        private String label;
        private String description;

        @JsonProperty("url")
        private String wikiUrl;

        private String wikipediaUrl;

//        public String getWikiUrl() {
//            return wikiUrlWrapper != null ? wikiUrlWrapper.getWikiUrl() : null;
//        }
//
//        @Data
//        public static class wikiUrlWrapper {
//            private String wikiUrl;
//        }


    }
}
