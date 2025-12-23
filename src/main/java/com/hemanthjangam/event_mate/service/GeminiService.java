package com.hemanthjangam.event_mate.service;

import com.hemanthjangam.event_mate.dto.gemini.GeminiRequest;
import com.hemanthjangam.event_mate.dto.gemini.GeminiResponse;
import com.hemanthjangam.event_mate.entity.Booking;
import com.hemanthjangam.event_mate.entity.Event;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;

import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@Slf4j
public class GeminiService {

        private final RestClient restClient;

        @Value("${gemini.api.key}")
        private String geminiApiKey;

        @Value("${gemini.api.url}")
        private String geminiApiUrl;

        public GeminiService(RestClient.Builder restClientBuilder) {
                this.restClient = restClientBuilder.build();
        }

        public String generateContent(String prompt) {
                try {
                        log.info("Generating content with Gemini API");

                        GeminiRequest request = GeminiRequest.builder()
                                        .contents(List.of(GeminiRequest.Content.builder()
                                                        .role("user")
                                                        .parts(List.of(GeminiRequest.Part.builder()
                                                                        .text(prompt)
                                                                        .build()))
                                                        .build()))
                                        .build();

                        GeminiResponse response = restClient.post()
                                        .uri(geminiApiUrl)
                                        .header("X-goog-api-key", geminiApiKey)
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .body(request)
                                        .retrieve()
                                        .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                                                        (req, resp) -> {
                                                                try {
                                                                        String body = new String(
                                                                                        resp.getBody().readAllBytes());
                                                                        log.error("Gemini API Error: {} {}",
                                                                                        resp.getStatusCode(), body);
                                                                        throw new RuntimeException(
                                                                                        "Gemini API Error: " + body);
                                                                } catch (java.io.IOException e) {
                                                                        log.error("Error reading response body", e);
                                                                        throw new RuntimeException("Gemini API Error");
                                                                }
                                                        })
                                        .body(GeminiResponse.class);

                        if (response != null && response.getCandidates() != null
                                        && !response.getCandidates().isEmpty()
                                        && response.getCandidates().get(0).getContent() != null
                                        && response.getCandidates().get(0).getContent().getParts() != null
                                        && !response.getCandidates().get(0).getContent().getParts().isEmpty()) {
                                String responseText = response.getCandidates().get(0)
                                                .getContent().getParts().get(0).getText();
                                log.info("Generated response: {}",
                                                responseText.substring(0, Math.min(100, responseText.length())));
                                return responseText;
                        }
                } catch (RuntimeException e) {
                        // Log the error message without stack trace for expected API errors
                        log.error("Gemini Service Runtime Error: {}", e.getMessage());
                        if (e.getMessage() != null && (e.getMessage().contains("429")
                                        || e.getMessage().contains("RESOURCE_EXHAUSTED"))) {
                                return "I'm currently unavailable due to high traffic (Quota Exceeded). Please try again later.";
                        }
                        return "I apologize, but there was an issue processing your request. Please try again later.";
                } catch (Exception e) {
                        log.error("Error generating content from Gemini", e);
                        return "I apologize, but I'm temporarily unable to process your request. Please try again later.";
                }
                return "No response from AI.";
        }

        public String getChatResponse(String userQuery, List<Event> events) {
                String eventContext = events.stream()
                                .map(event -> String.format(
                                                "- %s (Category: %s, Dates: %s to %s, Price: ₹%s, Venue: %s)",
                                                event.getTitle(), event.getCategory(), event.getStartDate(),
                                                event.getEndDate(),
                                                event.getPrice(), event.getVenue()))
                                .collect(Collectors.joining("\n"));

                String prompt = String.format(
                                """
                                                You are a helpful AI assistant for 'Event Mate', an event booking platform similar to BookMyShow.

                                                Available Events:
                                                %s

                                                User Query: %s

                                                Provide a helpful, conversational response. If the user asks about booking, guide them on how to book tickets.
                                                Keep your response concise and relevant to event booking.
                                                """,
                                eventContext, userQuery);

                return generateContent(prompt);
        }

        public String getRecommendations(List<Booking> userHistory, List<Event> upcomingEvents) {
                String history = userHistory.stream()
                                .map(b -> b.getEvent().getCategory())
                                .distinct()
                                .collect(Collectors.joining(", "));

                String upcoming = upcomingEvents.stream()
                                .map(e -> String.format("%s (%s)", e.getTitle(), e.getCategory()))
                                .limit(15)
                                .collect(Collectors.joining(", "));

                String prompt = String.format(
                                """
                                                Based on the user's booking history and preferences, recommend the top 3 events from the upcoming events.

                                                User's Booking History (Categories): %s
                                                Upcoming Events: %s

                                                Respond ONLY in this exact format:
                                                Recommendation 1: [Event Title]
                                                Recommendation 2: [Event Title]
                                                Recommendation 3: [Event Title]

                                                Then provide a brief explanation.
                                                """,
                                history.isEmpty() ? "None yet" : history, upcoming);

                return generateContent(prompt);
        }

        public List<Long> getRecommendedEventIds(List<Booking> userHistory, List<Event> upcomingEvents) {
                List<Long> recommendedIds = new ArrayList<>();

                try {
                        String history = userHistory.stream()
                                        .map(b -> b.getEvent().getCategory())
                                        .distinct()
                                        .collect(Collectors.joining(", "));

                        String eventList = upcomingEvents.stream()
                                        .map(e -> String.format("ID: %d, Title: %s, Category: %s",
                                                        e.getId(), e.getTitle(), e.getCategory()))
                                        .limit(20)
                                        .collect(Collectors.joining("\n"));

                        String prompt = String.format("""
                                        Based on the user's booking history, recommend 3 relevant events from the list.

                                        User Booking History (Categories): %s

                                        Available Events:
                                        %s

                                        Respond ONLY with the event IDs in this exact format:
                                        [ID1, ID2, ID3]

                                        For example: [1, 5, 8]
                                        """, history.isEmpty() ? "No history" : history, eventList);

                        String response = generateContent(prompt);

                        Pattern pattern = Pattern.compile("\\[(\\d+(?:\\s*,\\s*\\d+)*)\\]");
                        Matcher matcher = pattern.matcher(response);

                        if (matcher.find()) {
                                String ids = matcher.group(1);
                                String[] idArray = ids.split(",");
                                for (String id : idArray) {
                                        try {
                                                Long eventId = Long.parseLong(id.trim());
                                                if (upcomingEvents.stream().anyMatch(e -> e.getId().equals(eventId))) {
                                                        recommendedIds.add(eventId);
                                                }
                                        } catch (NumberFormatException e) {
                                                log.warn("Could not parse event ID: {}", id);
                                        }
                                }
                        }

                        if (!recommendedIds.isEmpty()) {
                                log.info("AI recommended {} events", recommendedIds.size());
                        }
                } catch (Exception e) {
                        log.error("Error getting AI recommendations", e);
                }

                return recommendedIds;
        }
}