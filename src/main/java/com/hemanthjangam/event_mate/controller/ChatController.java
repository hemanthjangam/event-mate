package com.hemanthjangam.event_mate.controller;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @PostMapping
    public ResponseEntity<Map<String, String>> chat(@RequestBody ChatRequest request) {
        String userMessage = request.getMessage().toLowerCase();
        String botResponse;

        if (userMessage.contains("hello") || userMessage.contains("hi")) {
            botResponse = "Hello! How can I help you find an event today?";
        } else if (userMessage.contains("book") || userMessage.contains("ticket")) {
            botResponse = "You can book tickets by selecting an event from the dashboard and clicking 'Book Now'.";
        } else if (userMessage.contains("event") || userMessage.contains("recommend")) {
            botResponse = "Check out our 'Recommended for You' section on the home page!";
        } else if (userMessage.contains("price") || userMessage.contains("cost")) {
            botResponse = "Prices vary by event. Please check the event details for specific pricing.";
        } else {
            botResponse = "I'm just a simple bot. Try asking about events, booking, or recommendations.";
        }

        return ResponseEntity.ok(Map.of("response", botResponse));
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ChatRequest {
        private String message;
    }
}
