package com.hemanthjangam.event_mate.service;

import com.hemanthjangam.event_mate.dto.ReviewDto;
import com.hemanthjangam.event_mate.entity.Event;
import com.hemanthjangam.event_mate.entity.Review;
import com.hemanthjangam.event_mate.entity.User;
import com.hemanthjangam.event_mate.repository.EventRepository;
import com.hemanthjangam.event_mate.repository.ReviewRepository;
import com.hemanthjangam.event_mate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.hemanthjangam.event_mate.exception.ResourceNotFoundException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    public ReviewDto addReview(ReviewDto reviewDto) {
        if (reviewDto.getUserId() == null || reviewDto.getEventId() == null) {
            throw new IllegalArgumentException("User ID and Event ID must not be null");
        }

        User user = userRepository.findById(reviewDto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + reviewDto.getUserId()));
        Event event = eventRepository.findById(reviewDto.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + reviewDto.getEventId()));

        Review review = Review.builder()
                .user(user)
                .event(event)
                .rating(reviewDto.getRating())
                .comment(reviewDto.getComment())
                .createdAt(LocalDateTime.now())
                .build();

        Review savedReview = reviewRepository.save(review);
        return mapToDto(savedReview);
    }

    public List<ReviewDto> getReviewsByEventId(Long eventId) {
        return reviewRepository.findByEventId(eventId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private ReviewDto mapToDto(Review review) {
        return ReviewDto.builder()
                .id(review.getId())
                .userId(review.getUser().getId())
                .userName(review.getUser().getName())
                .eventId(review.getEvent().getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
