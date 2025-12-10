package com.hemanthjangam.event_mate.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "event_sections")
public class EventSection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // e.g., "VIP", "Gold", "Silver"

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private int rows;

    @Column(nullable = false)
    private int cols;

    @ManyToOne
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(columnDefinition = "TEXT")
    private String layoutConfig; // JSON string for specific section layout
}
