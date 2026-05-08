package com.hemanthjangam.event_mate.service;

import com.hemanthjangam.event_mate.dto.UserDto;
import com.hemanthjangam.event_mate.entity.User;
import com.hemanthjangam.event_mate.exception.BadRequestException;
import com.hemanthjangam.event_mate.exception.ResourceNotFoundException;
import com.hemanthjangam.event_mate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    /**
     * Returns the profile for the current authenticated user.
     */
    public UserDto.ProfileResponse getProfile() {
        User user = getCurrentUser();
        return mapToResponse(user);
    }

    /**
     * Updates the current user's editable profile fields with uniqueness checks.
     */
    public UserDto.ProfileResponse updateProfile(UserDto.ProfileUpdateRequest request) {
        User user = getCurrentUser();

        if (request.getName() != null && !request.getName().isEmpty()) {
            user.setName(request.getName().trim());
        }
        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            String newEmail = request.getEmail().trim().toLowerCase();
            userRepository.findByEmail(newEmail)
                    .filter(existing -> !existing.getId().equals(user.getId()))
                    .ifPresent(existing -> {
                        throw new BadRequestException("An account already exists with this email.");
                    });
            user.setEmail(newEmail);
        }

        User savedUser = userRepository.save(java.util.Objects.requireNonNull(user));
        return mapToResponse(savedUser);
    }

    /**
     * Resolves the current authenticated user from the security context.
     */
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    /**
     * Maps the user entity to the profile response returned by the API.
     */
    private UserDto.ProfileResponse mapToResponse(User user) {
        return UserDto.ProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}
