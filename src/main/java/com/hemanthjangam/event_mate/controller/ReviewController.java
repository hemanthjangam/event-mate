package com.hemanthjangam.event_mate.controller;

import com.hemanthjangam.event_mate.dto.ReviewDto;
import com.hemanthjangam.event_mate.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ReviewDto> addReview(@RequestBody ReviewDto reviewDto) {
        return ResponseEntity.ok(reviewService.addReview(reviewDto));
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<ReviewDto>> getReviewsByEventId(@PathVariable Long eventId) {
        return ResponseEntity.ok(reviewService.getReviewsByEventId(eventId));
    }
}
