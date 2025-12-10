package com.hemanthjangam.event_mate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDto {
    private Long id;
    private Long userId;
    private String userName;
    private Long eventId;
    private int rating;
    private String comment;
    private LocalDateTime createdAt;
}
