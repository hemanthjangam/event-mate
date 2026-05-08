package com.hemanthjangam.event_mate.service;

import com.hemanthjangam.event_mate.dto.ReviewDto;
import com.hemanthjangam.event_mate.entity.Event;
import com.hemanthjangam.event_mate.entity.Review;
import com.hemanthjangam.event_mate.entity.User;
import com.hemanthjangam.event_mate.exception.BadRequestException;
import com.hemanthjangam.event_mate.exception.ResourceNotFoundException;
import com.hemanthjangam.event_mate.repository.EventRepository;
import com.hemanthjangam.event_mate.repository.ReviewRepository;
import com.hemanthjangam.event_mate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    /**
     * Creates a review for the authenticated user instead of trusting a client
     * supplied author ID.
     */
    public ReviewDto addReview(ReviewDto reviewDto) {
        if (reviewDto.getEventId() == null) {
            throw new BadRequestException("Event ID must not be null.");
        }
        if (reviewDto.getRating() < 1 || reviewDto.getRating() > 5) {
            throw new BadRequestException("Rating must be between 1 and 5.");
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        Event event = eventRepository.findById(java.util.Objects.requireNonNull(reviewDto.getEventId()))
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + reviewDto.getEventId()));

        Review review = Review.builder()
                .user(user)
                .event(event)
                .rating(reviewDto.getRating())
                .comment(reviewDto.getComment())
                .createdAt(LocalDateTime.now())
                .build();

        Review savedReview = reviewRepository.save(java.util.Objects.requireNonNull(review));
        return mapToDto(savedReview);
    }

    /**
     * Returns all reviews stored for a given event.
     */
    public List<ReviewDto> getReviewsByEventId(Long eventId) {
        return reviewRepository.findByEventId(eventId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Maps the review entity into the response payload consumed by the frontend.
     */
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
