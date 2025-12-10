package com.hemanthjangam.event_mate.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    private String venue;

    @Column(nullable = false)
    private LocalDateTime date;

    @Column(nullable = false)
    private BigDecimal price;

    private String imageUrl;

    private String category;

    private String trailerUrl;

    @ElementCollection
    private java.util.List<String> mediaUrls;

    private Integer duration; // in minutes

    private String censorRating;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<EventSection> sections;
}
