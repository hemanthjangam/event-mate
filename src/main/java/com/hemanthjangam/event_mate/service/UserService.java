package com.hemanthjangam.event_mate.service;

import com.hemanthjangam.event_mate.dto.UserDto;
import com.hemanthjangam.event_mate.entity.User;
import com.hemanthjangam.event_mate.repository.UserRepository;
import com.hemanthjangam.event_mate.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserDto.ProfileResponse getProfile() {
        User user = getCurrentUser();
        return mapToResponse(user);
    }

    public UserDto.ProfileResponse updateProfile(UserDto.ProfileUpdateRequest request) {
        User user = getCurrentUser();

        if (request.getName() != null && !request.getName().isEmpty()) {
            user.setName(request.getName());
        }
        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            user.setEmail(request.getEmail());
        }

        User savedUser = userRepository.save(user);
        return mapToResponse(savedUser);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    private UserDto.ProfileResponse mapToResponse(User user) {
        return UserDto.ProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}
