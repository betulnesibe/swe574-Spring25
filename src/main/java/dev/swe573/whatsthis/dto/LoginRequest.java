package dev.swe573.whatsthis.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
}
