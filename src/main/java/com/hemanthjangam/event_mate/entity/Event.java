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
    private java.time.LocalDate startDate;

    @Column(nullable = false)
    private java.time.LocalDate endDate;

    @ElementCollection
    @CollectionTable(name = "event_show_times", joinColumns = @JoinColumn(name = "event_id"))
    @Column(name = "show_time")
    private java.util.List<java.time.LocalTime> showTimes;

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

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<Booking> bookings;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id")
    private User organizer;

    private String groupId;

    private Double imdbRating;

    private String movieMode;

    @ElementCollection
    @CollectionTable(name = "event_cast", joinColumns = @JoinColumn(name = "event_id"))
    @Column(name = "cast_name")
    private java.util.List<String> cast;
}
