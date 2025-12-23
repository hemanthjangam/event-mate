package com.hemanthjangam.event_mate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EventDto {
    private Long id;
    private String title;
    private String description;
    private String venue;

    private BigDecimal price;
    private String imageUrl;
    private String category;
    private String trailerUrl;
    private java.util.List<String> mediaUrls;
    private String censorRating;
    private java.util.List<EventSectionDto> sections;
    private String groupId;
    private java.time.LocalDate startDate;
    private java.time.LocalDate endDate;
    private java.util.List<java.time.LocalTime> showTimes;
    private Integer duration; // in minutes
    private Double imdbRating;
    private String movieMode;
    private java.util.List<String> cast;

    // Legacy support for frontend
    private LocalDateTime date;
}
