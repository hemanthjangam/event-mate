package com.hemanthjangam.event_mate.controller;

import com.hemanthjangam.event_mate.dto.EventDto;
import com.hemanthjangam.event_mate.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping
    public ResponseEntity<List<EventDto>> getRecommendations() {
        // In a real app, we'd get the user ID from the security context
        return ResponseEntity.ok(recommendationService.getRecommendations(null));
    }
}
