package com.hemanthjangam.event_mate.service;

import com.hemanthjangam.event_mate.dto.EventDto;
import com.hemanthjangam.event_mate.dto.EventSectionDto;
import com.hemanthjangam.event_mate.entity.Event;
import com.hemanthjangam.event_mate.entity.EventSection;
import com.hemanthjangam.event_mate.repository.EventRepository;
import com.hemanthjangam.event_mate.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;

    public List<EventDto> getAllEvents() {
        return eventRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public EventDto getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));
        return mapToDto(event);
    }

    public EventDto createEvent(EventDto eventDto) {
        Event event = mapToEntity(eventDto);
        if (event.getSections() != null) {
            event.getSections().forEach(section -> section.setEvent(event));
        }
        Event savedEvent = eventRepository.save(event);
        return mapToDto(savedEvent);
    }

    public EventDto updateEvent(Long id, EventDto eventDto) {
        Event existingEvent = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));

        existingEvent.setTitle(eventDto.getTitle());
        existingEvent.setDescription(eventDto.getDescription());
        existingEvent.setVenue(eventDto.getVenue());
        existingEvent.setDate(eventDto.getDate());
        existingEvent.setPrice(eventDto.getPrice());
        existingEvent.setImageUrl(eventDto.getImageUrl());
        existingEvent.setCategory(eventDto.getCategory());
        existingEvent.setTrailerUrl(eventDto.getTrailerUrl());
        existingEvent.setMediaUrls(eventDto.getMediaUrls());
        existingEvent.setDuration(eventDto.getDuration());
        existingEvent.setCensorRating(eventDto.getCensorRating());

        // Note: Updating sections is complex and might require a separate strategy or
        // full replacement
        // For now, we'll assume sections are not updated via this simple PUT or we
        // clear and re-add
        if (eventDto.getSections() != null) {
            // clear existing if needed or merge. For simplicity in this step, we might skip
            // complex merge logic
            // or just append new ones. Let's assume full replacement for now if provided.
            if (existingEvent.getSections() != null) {
                existingEvent.getSections().clear();
            }
            List<EventSection> newSections = eventDto.getSections().stream()
                    .map(this::mapSectionToEntity)
                    .collect(Collectors.toList());
            newSections.forEach(s -> s.setEvent(existingEvent));
            if (existingEvent.getSections() == null) {
                existingEvent.setSections(newSections);
            } else {
                existingEvent.getSections().addAll(newSections);
            }
        }

        Event updatedEvent = eventRepository.save(existingEvent);
        return mapToDto(updatedEvent);
    }

    public void deleteEvent(Long id) {
        eventRepository.deleteById(id);
    }

    public List<EventDto> searchEvents(String category) {
        return eventRepository.findByCategory(category).stream()
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
                .trailerUrl(event.getTrailerUrl())
                .mediaUrls(event.getMediaUrls())
                .duration(event.getDuration())
                .censorRating(event.getCensorRating())
                .sections(event.getSections() != null
                        ? event.getSections().stream().map(this::mapSectionToDto).collect(Collectors.toList())
                        : null)
                .build();
    }

    private EventSectionDto mapSectionToDto(EventSection section) {
        return EventSectionDto.builder()
                .id(section.getId())
                .name(section.getName())
                .price(section.getPrice())
                .rows(section.getRows())
                .cols(section.getCols())
                .layoutConfig(section.getLayoutConfig()) // Map layoutConfig
                .build();
    }

    private Event mapToEntity(EventDto dto) {
        return Event.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .venue(dto.getVenue())
                .date(dto.getDate())
                .price(dto.getPrice())
                .imageUrl(dto.getImageUrl())
                .category(dto.getCategory())
                .trailerUrl(dto.getTrailerUrl())
                .mediaUrls(dto.getMediaUrls())
                .duration(dto.getDuration())
                .censorRating(dto.getCensorRating())
                .sections(dto.getSections() != null
                        ? dto.getSections().stream().map(this::mapSectionToEntity).collect(Collectors.toList())
                        : null)
                .build();
    }

    private EventSection mapSectionToEntity(EventSectionDto dto) {
        return EventSection.builder()
                .id(dto.getId())
                .name(dto.getName())
                .price(dto.getPrice())
                .rows(dto.getRows())
                .cols(dto.getCols())
                .layoutConfig(dto.getLayoutConfig()) // Map layoutConfig
                .build();
    }
}
