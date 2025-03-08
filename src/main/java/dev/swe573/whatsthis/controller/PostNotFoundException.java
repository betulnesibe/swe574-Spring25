package dev.swe573.whatsthis.controller;

public class PostNotFoundException extends RuntimeException{
    public PostNotFoundException(Long id) {
        super("Could not find post " + id);
    }
}
