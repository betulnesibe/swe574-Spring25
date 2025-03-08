package dev.swe573.whatsthis.controller;

public class CommentNotFoundException extends RuntimeException{
    public CommentNotFoundException(Long id) {
        super("Could not find comment " + id);
    }
}
