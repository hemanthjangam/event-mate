package com.hemanthjangam.event_mate.controller;

import com.hemanthjangam.event_mate.dto.EventDto;
import com.hemanthjangam.event_mate.entity.User;
import com.hemanthjangam.event_mate.repository.UserRepository;
import com.hemanthjangam.event_mate.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<EventDto>> getRecommendations() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = null;

        if (authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal())) {
            String userEmail = authentication.getName();
            userId = userRepository.findByEmail(userEmail)
                    .map(User::getId)
                    .orElse(null);
        }

        return ResponseEntity.ok(recommendationService.getRecommendations(userId));
    }
}
