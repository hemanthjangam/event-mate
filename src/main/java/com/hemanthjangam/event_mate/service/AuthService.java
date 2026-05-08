package com.hemanthjangam.event_mate.service;

import com.hemanthjangam.event_mate.config.JwtService;
import com.hemanthjangam.event_mate.dto.AuthDto;
import com.hemanthjangam.event_mate.exception.BadRequestException;
import com.hemanthjangam.event_mate.exception.ResourceNotFoundException;
import com.hemanthjangam.event_mate.entity.Role;
import com.hemanthjangam.event_mate.entity.User;
import com.hemanthjangam.event_mate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final SecureRandom OTP_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    /**
     * Registers a new customer account and returns an authenticated JWT payload.
     */
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        String email = normalizeEmail(request.getEmail());
        validatePassword(request.getPassword());

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("An account already exists with this email.");
        }

        User user = User.builder()
                .name(requireText(request.getName(), "Name is required."))
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.CUSTOMER)
                .active(true)
                .build();

        userRepository.save(user);
        emailService.sendEmail(
                user.getEmail(),
                "Welcome to Event Mate!",
                "Hi " + user.getName() + ",\n\nWelcome to Event Mate! We are excited to have you on board.\n\nBest,\nThe Event Mate Team");

        return buildAuthResponse(user);
    }

    /**
     * Authenticates a user with email and password and returns a fresh JWT.
     */
    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        String email = normalizeEmail(request.getEmail());
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword()));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        return buildAuthResponse(user);
    }

    /**
     * Generates a time-bound OTP and delivers it to the user email address.
     */
    public void generateOtp(String email) {
        User user = findUserByEmail(email);
        String otp = String.format("%06d", OTP_RANDOM.nextInt(1_000_000));

        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        emailService.sendEmail(
                user.getEmail(),
                "Your Login OTP",
                "Your OTP for Event Mate login is: " + otp + "\nIt expires in 10 minutes.");
    }

    /**
     * Authenticates the user with a valid, non-expired OTP and returns a JWT.
     */
    public AuthDto.AuthResponse loginWithOtp(AuthDto.OtpLoginRequest request) {
        User user = findUserByEmail(request.getEmail());
        validateOtp(user, request.getOtp());
        clearOtp(user);
        userRepository.save(user);
        return buildAuthResponse(user);
    }

    /**
     * Resets the password after a successful OTP verification.
     */
    public void resetPassword(AuthDto.ResetPasswordRequest request) {
        User user = findUserByEmail(request.getEmail());
        validateOtp(user, request.getOtp());
        validatePassword(request.getNewPassword());

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        clearOtp(user);
        userRepository.save(user);

        emailService.sendEmail(user.getEmail(), "Password Changed",
                "Your password has been successfully changed.");
    }

    /**
     * Builds the login/register response with a signed JWT token.
     */
    private AuthDto.AuthResponse buildAuthResponse(User user) {
        String jwtToken = jwtService.generateToken(user);
        return AuthDto.AuthResponse.builder()
                .token(jwtToken)
                .id(user.getId())
                .role(user.getRole().name())
                .name(user.getName())
                .build();
    }

    /**
     * Resolves a user by email and returns a consistent not-found error.
     */
    private User findUserByEmail(String email) {
        return userRepository.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }

    /**
     * Validates that the provided OTP matches the current active OTP for the user.
     */
    private void validateOtp(User user, String otp) {
        if (user.getOtp() == null || user.getOtpExpiry() == null || !user.getOtp().equals(otp)) {
            throw new BadRequestException("Invalid OTP.");
        }
        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP expired.");
        }
    }

    /**
     * Clears any active OTP after successful use.
     */
    private void clearOtp(User user) {
        user.setOtp(null);
        user.setOtpExpiry(null);
    }

    /**
     * Normalizes email input so lookups and uniqueness checks are consistent.
     */
    private String normalizeEmail(String email) {
        return requireText(email, "Email is required.").toLowerCase();
    }

    /**
     * Enforces a minimal password policy for registration and reset flows.
     */
    private void validatePassword(String password) {
        if (password == null || password.length() < 8) {
            throw new BadRequestException("Password must be at least 8 characters long.");
        }
    }

    /**
     * Rejects blank values with a caller-provided validation message.
     */
    private String requireText(String value, String message) {
        if (value == null || value.trim().isEmpty()) {
            throw new BadRequestException(message);
        }
        return value.trim();
    }
}
