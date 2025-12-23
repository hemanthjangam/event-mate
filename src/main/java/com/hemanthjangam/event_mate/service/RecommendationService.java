package com.hemanthjangam.event_mate.service;

import com.hemanthjangam.event_mate.dto.EventDto;
import com.hemanthjangam.event_mate.entity.Booking;
import com.hemanthjangam.event_mate.entity.Event;
import com.hemanthjangam.event_mate.repository.BookingRepository;
import com.hemanthjangam.event_mate.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final EventRepository eventRepository;
    private final GeminiService geminiService;
    private final BookingRepository bookingRepository;

    public List<EventDto> getRecommendations(Long userId) {
        List<Event> allEvents = eventRepository.findAll();

        if (userId != null) {
            List<Booking> userHistory = bookingRepository.findByUserId(userId);
            if (!userHistory.isEmpty()) {
                List<Long> recommendedIds = geminiService.getRecommendedEventIds(userHistory, allEvents);

                if (!recommendedIds.isEmpty()) {
                    List<Event> recommendedEvents = allEvents.stream()
                            .filter(event -> recommendedIds.contains(event.getId()))
                            .collect(Collectors.toList());

                    if (!recommendedEvents.isEmpty()) {
                        return recommendedEvents.stream()
                                .map(this::mapToDto)
                                .collect(Collectors.toList());
                    }
                }
            }
        }

        // Fallback: Return random events or latest events
        Collections.shuffle(allEvents);

        return allEvents.stream()
                .limit(5)
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private EventDto mapToDto(Event event) {
        return EventDto.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .venue(event.getVenue())
                .startDate(event.getStartDate())
                .endDate(event.getEndDate())
                .showTimes(event.getShowTimes())
                .price(event.getPrice())
                .imageUrl(event.getImageUrl())
                .category(event.getCategory())
                .build();
    }
}
