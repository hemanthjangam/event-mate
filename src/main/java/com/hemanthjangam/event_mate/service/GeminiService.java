package com.hemanthjangam.event_mate.service;

import com.hemanthjangam.event_mate.dto.gemini.GeminiRequest;
import com.hemanthjangam.event_mate.dto.gemini.GeminiResponse;
import com.hemanthjangam.event_mate.entity.Booking;
import com.hemanthjangam.event_mate.entity.Event;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GeminiService {

        private final RestClient restClient;

        // Renaming keys to avoid conflict with stale (redacted) application.properties
        @Value("${gemini.api.key}")
        private String geminiApiKey;

        @Value("${gemini.service.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent}")
        private String geminiApiUrl;

        public GeminiService(RestClient.Builder restClientBuilder) {
                this.restClient = restClientBuilder.build();
        }

        public String generateContent(String prompt) {
                try {
                        System.out.println("DEBUG: Using Gemini API URL: " + geminiApiUrl);
                        System.out.println("DEBUG: Using Gemini API Key: "
                                        + (geminiApiKey != null && geminiApiKey.length() > 5
                                                        ? "..." + geminiApiKey.substring(geminiApiKey.length() - 5)
                                                        : "null/short"));

                        GeminiRequest request = GeminiRequest.builder()
                                        .contents(List.of(GeminiRequest.Content.builder()
                                                        .parts(List.of(GeminiRequest.Part.builder()
                                                                        .text(prompt)
                                                                        .build()))
                                                        .build()))
                                        .build();

                        GeminiResponse response = restClient.post()
                                        .uri(geminiApiUrl + "?key=" + geminiApiKey)
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .body(request)
                                        .retrieve()
                                        .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                                                        (req, resp) -> {
                                                                String responseBody = new String(
                                                                                resp.getBody().readAllBytes());
                                                                if (resp.getStatusCode().value() == 429) {
                                                                        throw new RuntimeException(
                                                                                        "Rate Limit Exceeded. Please try again in 5-10 seconds.");
                                                                }
                                                                System.err.println("API Error: " + resp.getStatusCode()
                                                                                + " - " + responseBody);
                                                                throw new RuntimeException(
                                                                                "Gemini API Error: " + responseBody);
                                                        })
                                        .body(GeminiResponse.class);

                        if (response != null && response.getCandidates() != null
                                        && !response.getCandidates().isEmpty()) {
                                GeminiResponse.Candidate candidate = response.getCandidates().get(0);
                                if (candidate.getContent() != null && candidate.getContent().getParts() != null
                                                && !candidate.getContent().getParts().isEmpty()) {
                                        return candidate.getContent().getParts().get(0).getText();
                                }
                        }
                } catch (Exception e) {
                        System.err.println("Exception in GeminiService: " + e.getMessage());
                        if (e.getMessage().contains("Rate Limit")) {
                                return "I'm receiving too many requests right now. Please give me a 10-second break and try again! 🤖💤";
                        }
                        e.printStackTrace();
                        return "Error: " + e.getMessage();
                }
                return "I'm sorry, I couldn't generate a response at this time.";
        }

        public String getChatResponse(String userQuery, List<Event> events) {
                String eventContext = events.stream()
                                .map(event -> {
                                        String description = event.getDescription();
                                        if (description != null && description.length() > 100) {
                                                description = description.substring(0, 100) + "...";
                                        }
                                        return String.format("- %s (Date: %s, Venue: %s, Price: %s): %s",
                                                        event.getTitle(), event.getDate(), event.getVenue(),
                                                        event.getPrice(), description);
                                })
                                .collect(Collectors.joining("\n"));

                String prompt = String.format(
                                """
                                                You are a helpful AI assistant for an event booking platform called 'Event Mate'.
                                                Here is a list of upcoming events:
                                                %s

                                                User Query: %s

                                                Please answer the user's query based on the provided event information. If the query is not related to events, try to be helpful but mention your primary role.
                                                """,
                                eventContext, userQuery);

                return generateContent(prompt);
        }

        public String getRecommendations(List<Booking> userHistory, List<Event> upcomingEvents) {
                String historyContext = userHistory.isEmpty() ? "No previous bookings."
                                : userHistory.stream()
                                                .map(booking -> booking.getEvent().getTitle() + " ("
                                                                + booking.getEvent().getCategory() + ")")
                                                .collect(Collectors.joining(", "));

                String upcomingContext = upcomingEvents.stream()
                                .map(event -> String.format("- %s (Category: %s, Date: %s)", event.getTitle(),
                                                event.getCategory(),
                                                event.getDate()))
                                .collect(Collectors.joining("\n"));

                String prompt = String.format(
                                """
                                                Based on the user's booking history, recommend 3 upcoming events from the list.

                                                User's Booking History:
                                                %s

                                                Upcoming Events:
                                                %s

                                                Provide the recommendations in a friendly, personalized format. Explain why you think they would like these events.
                                                """,
                                historyContext, upcomingContext);

                return generateContent(prompt);
        }

        public List<Long> getRecommendedEventIds(List<Booking> userHistory, List<Event> upcomingEvents) {
                String historyContext = userHistory.isEmpty() ? "No previous bookings."
                                : userHistory.stream()
                                                .map(booking -> booking.getEvent().getTitle() + " ("
                                                                + booking.getEvent().getCategory() + ")")
                                                .collect(Collectors.joining(", "));

                String upcomingContext = upcomingEvents.stream()
                                .map(event -> String.format("ID: %d, %s (Category: %s, Date: %s)", event.getId(),
                                                event.getTitle(), event.getCategory(),
                                                event.getDate()))
                                .collect(Collectors.joining("\n"));

                String prompt = String.format(
                                """
                                                Based on the user's booking history, recommend 3 upcoming events from the list.

                                                User's Booking History:
                                                %s

                                                Upcoming Events:
                                                %s

                                                Strictly return ONLY the IDs of the 3 recommended events as a comma-separated list (e.g., 1, 5, 12). Do not include any other text or explanation.
                                                """,
                                historyContext, upcomingContext);

                String response = generateContent(prompt);
                try {
                        if (response.contains(",")) {
                                return java.util.Arrays.stream(response.split(","))
                                                .map(String::trim)
                                                .map(Long::parseLong)
                                                .collect(Collectors.toList());
                        } else {
                                // Try to parse single ID if only one is returned or if format is just a number
                                return List.of(Long.parseLong(response.trim()));
                        }
                } catch (NumberFormatException e) {
                        return java.util.Collections.emptyList();
                }
        }
}
