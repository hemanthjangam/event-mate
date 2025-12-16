package com.hemanthjangam.event_mate.controller;

import com.hemanthjangam.event_mate.entity.Booking;
import com.hemanthjangam.event_mate.entity.Event;
import com.hemanthjangam.event_mate.entity.User;
import com.hemanthjangam.event_mate.repository.BookingRepository;
import com.hemanthjangam.event_mate.repository.EventRepository;
import com.hemanthjangam.event_mate.repository.UserRepository;
import com.hemanthjangam.event_mate.service.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AIChatController {

    private final GeminiService geminiService;
    private final EventRepository eventRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> request) {
        String userQuery = request.get("query");
        if (userQuery == null || userQuery.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Query cannot be empty"));
        }

        List<Event> upcomingEvents = eventRepository.findAll(); // Optimally filter for future events
        String response = geminiService.getChatResponse(userQuery, upcomingEvents);

        return ResponseEntity.ok(Map.of("response", response));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<Map<String, String>> getRecommendations() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Booking> userHistory = bookingRepository.findByUser(user);
        List<Event> upcomingEvents = eventRepository.findAll(); // Optimally filter for future events

        String recommendations = geminiService.getRecommendations(userHistory, upcomingEvents);

        return ResponseEntity.ok(Map.of("recommendations", recommendations));
    }
}
