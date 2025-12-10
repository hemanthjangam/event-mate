package com.hemanthjangam.event_mate.service;

import com.hemanthjangam.event_mate.dto.EventDto;
import com.hemanthjangam.event_mate.entity.Event;
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

    public List<EventDto> getRecommendations(Long userId) {
        // Simple stub: Return random events or latest events
        // In a real AI implementation, we would call a Python service or use an ML
        // model

        List<Event> allEvents = eventRepository.findAll();
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
                .date(event.getDate())
                .price(event.getPrice())
                .imageUrl(event.getImageUrl())
                .category(event.getCategory())
                .build();
    }
}
