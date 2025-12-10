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
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(nullable = false)
    private String seatNo; // e.g., "A5" - derived or manual

    @Column(nullable = false)
    private int rowNumber;

    @Column(nullable = false)
    private int colNumber;

    @ManyToOne
    @JoinColumn(name = "section_id", nullable = false)
    private EventSection section;

    @Column(nullable = false)
    private java.math.BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketStatus status;

    public enum TicketStatus {
        BOOKED,
        CANCELLED,
        USED
    }
}
