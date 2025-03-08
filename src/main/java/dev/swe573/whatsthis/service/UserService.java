package dev.swe573.whatsthis.service;


import dev.swe573.whatsthis.controller.UserNotFoundException;
import dev.swe573.whatsthis.dto.UserDto;
import dev.swe573.whatsthis.model.User;
import dev.swe573.whatsthis.model.Post;
import dev.swe573.whatsthis.model.Comment;
import dev.swe573.whatsthis.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService implements UserDetailsService{

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepo userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UserDto> all() {
        List<User> users = userRepo.findAll();
        return users.stream().map(this::toDto).collect(Collectors.toList());
    }

    public UserDto one(@PathVariable Long id) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));

        return toDto(user);
    }

    public UserDto newUser(UserDto userDto) {
        if (userRepo.findByUsername(userDto.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already taken");
        }
        if (userRepo.findByEmail(userDto.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already in use");
        }

        User user = toEntity(userDto);

        // encrypt the password before saving
        user.setPassword(passwordEncoder.encode(userDto.getPassword()));

        // assign default role if not already set
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            user.setRoles(Set.of("USER"));
        }

        User savedUser = userRepo.save(user);
        return toDto(savedUser);
    }

    public UserDto replaceUser(Long id, UserDto userDto) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));

        // Only update non-sensitive fields
        if (userDto.getUsername() != null) {
            user.setUsername(userDto.getUsername());
        }
        if (userDto.getEmail() != null) {
            user.setEmail(userDto.getEmail());
        }
        if (userDto.getBio() != null) {
            user.setBio(userDto.getBio());
        }
        if (userDto.getProfilePictureUrl() != null) {
            user.setProfilePictureUrl(userDto.getProfilePictureUrl());
        }
        // Don't update password here
        // Don't update roles here
        // Don't update createdAt here

        User updatedUser = userRepo.save(user);
        return toDto(updatedUser);
    }

    public void deleteUser(Long id) {
        userRepo.deleteById(id);
    }

    private UserDto toDto(User user) {
        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setUsername(user.getUsername());
        userDto.setEmail(user.getEmail());
        userDto.setRoles(user.getRoles());
        userDto.setBio(user.getBio());
        userDto.setProfilePictureUrl(user.getProfilePictureUrl());
        userDto.setCreatedAt(user.getCreatedAt());
        return userDto;
    }

    private User toEntity(UserDto userDto) {
        User user = new User();
        user.setUsername(userDto.getUsername());
        user.setEmail(userDto.getEmail());
        user.setPassword(userDto.getPassword());
        user.setRoles(userDto.getRoles());
        user.setBio(userDto.getBio());
        user.setProfilePictureUrl(userDto.getProfilePictureUrl());
        user.setCreatedAt(userDto.getCreatedAt());
        return user;
    }

    //we need to add this error to user exception class
    @Override
    public UserDetails loadUserByUsername(String username) {
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                user.getRoles().stream().map(SimpleGrantedAuthority::new).collect(Collectors.toList())
        );
    }

    public boolean existsByUsername(String username) {
        return userRepo.findByUsername(username).isPresent();
    }

    public boolean existsByEmail(String email) {
        return userRepo.findByEmail(email).isPresent();
    }

    public Optional<User> findByUsername(String username) {
        return userRepo.findByUsername(username);
    }

    public UserDto updateProfilePicture(Long userId, String profilePictureUrl) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        
        user.setProfilePictureUrl(profilePictureUrl);
        User savedUser = userRepo.save(user);
        return toDto(savedUser);
    }
}