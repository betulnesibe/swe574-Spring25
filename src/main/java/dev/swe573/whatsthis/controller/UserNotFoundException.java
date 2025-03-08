package dev.swe573.whatsthis.controller;

public class UserNotFoundException extends RuntimeException{
    public UserNotFoundException(Long id) {
        super("Could not find user " + id);
    }
}
