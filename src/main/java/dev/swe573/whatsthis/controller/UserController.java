package dev.swe573.whatsthis.controller;

import dev.swe573.whatsthis.dto.LoginRequest;
import dev.swe573.whatsthis.dto.UserDto;
import dev.swe573.whatsthis.service.UserService;
import dev.swe573.whatsthis.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final FileUploadController fileUploadController;

    @Autowired
    public UserController(UserService userService, JwtUtil jwtUtil, AuthenticationManager authenticationManager, FileUploadController fileUploadController) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.fileUploadController = fileUploadController;
    }

    @GetMapping()
    public CollectionModel<EntityModel<UserDto>> all() {
        List<EntityModel<UserDto>> users = userService.all().stream()
                .map(userDto -> {
                    EntityModel<UserDto> userModel = EntityModel.of(userDto);
                    userModel.add(linkTo(methodOn(UserController.class).one(userDto.getId())).withSelfRel());
                    return userModel;
                })
                .collect(Collectors.toList());

        return CollectionModel.of(users, linkTo(methodOn(UserController.class).all()).withSelfRel());
    }

    @PostMapping("/signup")
    public ResponseEntity<Map<String, String>> signup(@RequestBody UserDto userDto) {
        try {
            UserDto savedUser = userService.newUser(userDto);
            Map<String, String> response = new HashMap<>();
            response.put("message", "User registered successfully");
            response.put("userId", savedUser.getId().toString());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserDto loginRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );
            var user = userService.findByUsername(loginRequest.getUsername())
                    .orElseThrow(() -> new RuntimeException("Invalid username or password"));

            String token = jwtUtil.generateToken(user.getId());
            return ResponseEntity.ok(Map.of("token", token,
                    "id", user.getId(),
                    "username", user.getUsername(),
                    "email", user.getEmail()));
        } catch (AuthenticationException e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid username or password"));
        }
    }

    @GetMapping("/{id}")
    public EntityModel<UserDto> one(@PathVariable Long id) {
        UserDto userDto = userService.one(id);


        EntityModel<UserDto> userModel = EntityModel.of(userDto);
        userModel.add(linkTo(methodOn(UserController.class).one(id)).withSelfRel());
        userModel.add(linkTo(methodOn(UserController.class).all()).withRel("users"));
        //TODO: There should be links that connects user's previous posts and comments.

        return userModel;
    }

    @PutMapping("/{id}")
    public EntityModel<UserDto> replaceUser(@PathVariable Long id, @RequestBody UserDto userDto) {
        UserDto updatedUser = userService.replaceUser(id, userDto);

        EntityModel<UserDto> userModel = EntityModel.of(updatedUser);
        userModel.add(linkTo(methodOn(UserController.class).one(id)).withSelfRel());
        userModel.add(linkTo(methodOn(UserController.class).all()).withRel("users"));

        return userModel;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/profile-picture")
    public ResponseEntity<?> uploadProfilePicture(@PathVariable Long id, @RequestParam("image") MultipartFile file) {
        try {
            List<MultipartFile> images = List.of(file);
            ResponseEntity<List<String>> uploadResponse = fileUploadController.uploadImages(images);
            
            if (uploadResponse.getStatusCode() != HttpStatus.OK || uploadResponse.getBody() == null || uploadResponse.getBody().isEmpty()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to upload profile picture"));
            }

            String profilePictureUrl = uploadResponse.getBody().get(0);
            UserDto updatedUser = userService.updateProfilePicture(id, profilePictureUrl);
            
            return ResponseEntity.ok(Map.of(
                "profilePictureUrl", profilePictureUrl,
                "message", "Profile updated successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to update profile picture"));
        }
    }
}
