package com.hemanthjangam.event_mate.controller;

import com.hemanthjangam.event_mate.dto.UserDto;
import com.hemanthjangam.event_mate.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserDto.ProfileResponse> getProfile() {
        return ResponseEntity.ok(userService.getProfile());
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDto.ProfileResponse> updateProfile(@RequestBody UserDto.ProfileUpdateRequest request) {
        return ResponseEntity.ok(userService.updateProfile(request));
    }
}
