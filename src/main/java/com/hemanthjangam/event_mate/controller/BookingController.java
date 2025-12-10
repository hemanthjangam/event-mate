package com.hemanthjangam.event_mate.controller;

import com.hemanthjangam.event_mate.dto.BookingDto;
import com.hemanthjangam.event_mate.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingDto.BookingResponse> createBooking(@RequestBody BookingDto.BookingRequest request) {
        return ResponseEntity.ok(bookingService.createBooking(request));
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<List<BookingDto.BookingResponse>> getUserBookings() {
        return ResponseEntity.ok(bookingService.getUserBookings());
    }

    @GetMapping("/event/{eventId}/seats")
    public ResponseEntity<List<String>> getBookedSeats(@PathVariable Long eventId) {
        return ResponseEntity.ok(bookingService.getBookedSeats(eventId));
    }
}
