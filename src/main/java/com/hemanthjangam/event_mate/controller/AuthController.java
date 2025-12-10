package com.hemanthjangam.event_mate.controller;

import com.hemanthjangam.event_mate.service.AuthService;
import com.hemanthjangam.event_mate.dto.AuthDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthDto.AuthResponse> register(
            @RequestBody AuthDto.RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDto.AuthResponse> login(
            @RequestBody AuthDto.LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/otp/generate")
    public ResponseEntity<String> generateOtp(@RequestBody AuthDto.OtpRequest request) {
        authService.generateOtp(request.getEmail());
        return ResponseEntity.ok("OTP sent successfully");
    }

    @PostMapping("/otp/login")
    public ResponseEntity<AuthDto.AuthResponse> loginWithOtp(
            @RequestBody AuthDto.OtpLoginRequest request) {
        return ResponseEntity.ok(authService.loginWithOtp(request));
    }
}
