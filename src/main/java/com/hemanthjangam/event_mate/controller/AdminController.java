package com.hemanthjangam.event_mate.controller;

import com.hemanthjangam.event_mate.dto.BookingDto;
import com.hemanthjangam.event_mate.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final BookingService bookingService;

    @GetMapping("/bookings")
    public ResponseEntity<List<BookingDto.BookingResponse>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }
}
