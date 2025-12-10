package com.hemanthjangam.event_mate.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "seating_layouts")
public class SeatingLayout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private int totalRows;

    @Column(nullable = false)
    private int totalCols;

    @Column(columnDefinition = "TEXT")
    private String config; // JSON string representing the layout (e.g., gaps, seat categories)
}
