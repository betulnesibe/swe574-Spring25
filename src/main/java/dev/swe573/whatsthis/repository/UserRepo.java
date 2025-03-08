package dev.swe573.whatsthis.repository;

import dev.swe573.whatsthis.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepo extends JpaRepository<User, Long> {
    // Method to find user by username
    Optional<User> findByUsername(String username);

    // Method to find user by email
    Optional<User> findByEmail(String email);

    // Check if a user with the given username exists
    boolean existsByUsername(String username);

    // Check if a user with the given email exists
    boolean existsByEmail(String email);
}
