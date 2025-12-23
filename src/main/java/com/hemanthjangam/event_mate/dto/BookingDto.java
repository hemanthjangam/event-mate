package com.hemanthjangam.event_mate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class BookingDto {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class BookingRequest {
        private Long eventId;
        private LocalDateTime showDate;
        private List<TicketRequest> tickets;
        private String paymentMethod;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TicketRequest {
        private Long sectionId;
        private int row;
        private int col;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class BookingResponse {
        private Long bookingId;
        private Long eventId;
        private String eventTitle;
        private LocalDateTime bookingDate;
        private LocalDateTime showDate;
        private String paymentStatus;
        private BigDecimal totalAmount;
        private List<String> tickets;
        private String customerName;
        private String customerEmail;
    }
}
