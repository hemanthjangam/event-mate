package com.hemanthjangam.event_mate.service;

import com.hemanthjangam.event_mate.config.JwtService;
import com.hemanthjangam.event_mate.dto.AuthDto;
import com.hemanthjangam.event_mate.entity.Role;
import com.hemanthjangam.event_mate.entity.User;
import com.hemanthjangam.event_mate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;
        private final EmailService emailService;

        public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
                var role = Role.CUSTOMER;
                if (request.getRole() != null && !request.getRole().isEmpty()) {
                        try {
                                role = Role.valueOf(request.getRole().toUpperCase());
                        } catch (IllegalArgumentException e) {
                                // Invalid role, default to CUSTOMER
                                role = Role.CUSTOMER;
                        }
                }

                var user = User.builder()
                                .name(request.getName())
                                .email(request.getEmail())
                                .passwordHash(passwordEncoder.encode(request.getPassword()))
                                .role(role)
                                .active(true)
                                .build();

                userRepository.save(java.util.Objects.requireNonNull(user));

                // Send Welcome Email
                emailService.sendEmail(
                                user.getEmail(),
                                "Welcome to Event Mate!",
                                "Hi " + user.getName()
                                                + ",\n\nWelcome to Event Mate! We are excited to have you on board.\n\nBest,\nThe Event Mate Team");

                var jwtToken = jwtService.generateToken(user);
                return AuthDto.AuthResponse.builder()
                                .token(jwtToken)
                                .id(user.getId())
                                .role(user.getRole().name())
                                .name(user.getName())
                                .build();
        }

        public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));
                var user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow();
                var jwtToken = jwtService.generateToken(user);
                return AuthDto.AuthResponse.builder()
                                .token(jwtToken)
                                .id(user.getId())
                                .role(user.getRole().name())
                                .name(user.getName())
                                .build();
        }

        public void generateOtp(String email) {
                var user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                String otp = String.format("%06d", new java.util.Random().nextInt(999999));
                user.setOtp(otp);
                user.setOtpExpiry(java.time.LocalDateTime.now().plusMinutes(10));
                userRepository.save(user);

                emailService.sendEmail(email, "Your Login OTP",
                                "Your OTP for Event Mate login is: " + otp + "\nIt expires in 10 minutes.");
        }

        public AuthDto.AuthResponse loginWithOtp(AuthDto.OtpLoginRequest request) {
                var user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                if (user.getOtp() == null || !user.getOtp().equals(request.getOtp())) {
                        throw new RuntimeException("Invalid OTP");
                }

                if (user.getOtpExpiry().isBefore(java.time.LocalDateTime.now())) {
                        throw new RuntimeException("OTP Expired");
                }

                // Clear OTP after successful login
                user.setOtp(null);
                user.setOtpExpiry(null);
                userRepository.save(user);

                var jwtToken = jwtService.generateToken(user);
                return AuthDto.AuthResponse.builder()
                                .token(jwtToken)
                                .id(user.getId())
                                .role(user.getRole().name())
                                .name(user.getName())
                                .build();
        }

        public void resetPassword(AuthDto.ResetPasswordRequest request) {
                var user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                if (user.getOtp() == null || !user.getOtp().equals(request.getOtp())) {
                        throw new RuntimeException("Invalid OTP");
                }

                if (user.getOtpExpiry().isBefore(java.time.LocalDateTime.now())) {
                        throw new RuntimeException("OTP Expired");
                }

                // Update Password
                user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
                // Clear OTP
                user.setOtp(null);
                user.setOtpExpiry(null);
                userRepository.save(user);

                emailService.sendEmail(user.getEmail(), "Password Changed",
                                "Your password has been successfully changed.");
        }
}
