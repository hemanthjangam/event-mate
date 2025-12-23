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
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;

    // User View: Returns unique events (one per group)
    public List<EventDto> getAllEvents() {
        return eventRepository.findUniqueEventsByGroupId().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // Admin View: Returns ALL events (including duplicates for dates)
    public List<EventDto> getAllEventsAdmin() {
        return eventRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public EventDto getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));
        return mapToDto(event);
    }

    public List<EventDto> getEventsByGroupId(String groupId) {
        return eventRepository.findByGroupIdOrderByStartDateAsc(groupId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private void validateEvent(EventDto eventDto) {
        if (eventDto.getStartDate() != null && eventDto.getEndDate() != null) {
            if (eventDto.getStartDate().isAfter(eventDto.getEndDate())) {
                throw new com.hemanthjangam.event_mate.exception.BadRequestException(
                        "Start date cannot be after end date");
            }
        }
        if (eventDto.getShowTimes() == null || eventDto.getShowTimes().isEmpty()) {
            throw new com.hemanthjangam.event_mate.exception.BadRequestException(
                    "At least one show time must be specified");
        }
    }

    public EventDto createEvent(EventDto eventDto) {
        validateEvent(eventDto);
        Event event = mapToEntity(eventDto);

        // Assign a new Group ID if not present (creating a single event is a group of
        // one)
        if (event.getGroupId() == null || event.getGroupId().isEmpty()) {
            event.setGroupId(UUID.randomUUID().toString());
        }

        if (event.getSections() != null) {
            event.getSections().forEach(section -> section.setEvent(event));
        }

        // Set the organizer from the security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        // logic to set organizer if needed, currently not mapped in DTO -> Entity fully
        // for organizer
        Event savedEvent = eventRepository.save(event);
        return mapToDto(savedEvent);
    }

    public EventDto updateEvent(Long id, EventDto eventDto) {
        validateEvent(eventDto);
        Event existingEvent = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));

        existingEvent.setTitle(eventDto.getTitle());
        existingEvent.setDescription(eventDto.getDescription());
        existingEvent.setVenue(eventDto.getVenue());
        existingEvent.setStartDate(eventDto.getStartDate());
        existingEvent.setEndDate(eventDto.getEndDate());
        existingEvent.setShowTimes(eventDto.getShowTimes());
        existingEvent.setPrice(eventDto.getPrice());
        existingEvent.setImageUrl(eventDto.getImageUrl());
        existingEvent.setCategory(eventDto.getCategory());
        existingEvent.setTrailerUrl(eventDto.getTrailerUrl());
        existingEvent.setMediaUrls(eventDto.getMediaUrls());
        existingEvent.setDuration(eventDto.getDuration());
        existingEvent.setCensorRating(eventDto.getCensorRating());
        existingEvent.setImdbRating(eventDto.getImdbRating());
        existingEvent.setMovieMode(eventDto.getMovieMode());
        existingEvent.setCast(eventDto.getCast());
        if (eventDto.getGroupId() != null) {
            existingEvent.setGroupId(eventDto.getGroupId());
        }

        if (eventDto.getSections() != null) {
            if (existingEvent.getSections() != null) {
                existingEvent.getSections().clear();
            }
            List<EventSection> newSections = eventDto.getSections().stream()
                    .map(dto -> mapSectionToEntity(dto, existingEvent))
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
        return eventRepository.findUniqueEventsByCategory(category).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private EventDto mapToDto(Event event) {
        java.time.LocalDateTime legacyDate = null;
        if (event.getStartDate() != null && event.getShowTimes() != null && !event.getShowTimes().isEmpty()) {
            legacyDate = event.getStartDate().atTime(event.getShowTimes().get(0));
        }

        return EventDto.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .venue(event.getVenue())
                .startDate(event.getStartDate())
                .endDate(event.getEndDate())
                .showTimes(event.getShowTimes())
                .date(legacyDate)
                .price(event.getPrice())
                .imageUrl(event.getImageUrl())
                .category(event.getCategory())
                .trailerUrl(event.getTrailerUrl())
                .mediaUrls(event.getMediaUrls())
                .duration(event.getDuration())
                .censorRating(event.getCensorRating())
                .sections(event.getSections() != null
                        ? event.getSections().stream()
                                .map(this::mapSectionToDto)
                                .collect(Collectors.toList())
                        : null)
                .imdbRating(event.getImdbRating())
                .movieMode(event.getMovieMode())
                .cast(event.getCast())
                .build();
    }

    private EventSectionDto mapSectionToDto(EventSection section) {
        return EventSectionDto.builder()
                .id(section.getId())
                .name(section.getName())
                .price(section.getPrice())
                .rows(section.getRows())
                .cols(section.getCols())
                .layoutConfig(section.getLayoutConfig())
                .build();
    }

    private Event mapToEntity(EventDto dto) {
        Event event = Event.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .venue(dto.getVenue())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .showTimes(dto.getShowTimes())
                .price(dto.getPrice())
                .imageUrl(dto.getImageUrl())
                .category(dto.getCategory())
                .trailerUrl(dto.getTrailerUrl())
                .mediaUrls(dto.getMediaUrls())
                .duration(dto.getDuration())
                .censorRating(dto.getCensorRating())
                .imdbRating(dto.getImdbRating())
                .movieMode(dto.getMovieMode())
                .cast(dto.getCast())
                .build();

        if (dto.getSections() != null) {
            List<EventSection> sections = dto.getSections().stream()
                    .map(sDto -> mapSectionToEntity(sDto, event))
                    .collect(Collectors.toList());
            event.setSections(sections);
        }
        return event;
    }

    private EventSection mapSectionToEntity(EventSectionDto dto, Event event) {
        return EventSection.builder()
                .id(dto.getId())
                .name(dto.getName())
                .price(dto.getPrice())
                .rows(dto.getRows())
                .cols(dto.getCols())
                .layoutConfig(dto.getLayoutConfig())
                .event(event)
                .build();
    }
}
