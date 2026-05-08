package com.hemanthjangam.event_mate.service;

import com.hemanthjangam.event_mate.dto.EventDto;
import com.hemanthjangam.event_mate.dto.EventSectionDto;
import com.hemanthjangam.event_mate.exception.BadRequestException;
import com.hemanthjangam.event_mate.entity.Event;
import com.hemanthjangam.event_mate.entity.EventSection;
import com.hemanthjangam.event_mate.entity.User;
import com.hemanthjangam.event_mate.repository.EventRepository;
import com.hemanthjangam.event_mate.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.security.core.context.SecurityContextHolder;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;

    /**
     * Returns one representative event per group for the public catalogue.
     */
    public List<EventDto> getAllEvents() {
        return eventRepository.findUniqueEventsByGroupId().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Returns the complete event list for admin management screens.
     */
    public List<EventDto> getAllEventsAdmin() {
        return eventRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Loads a single event by its database identifier.
     */
    public EventDto getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));
        return mapToDto(event);
    }

    /**
     * Returns all events that belong to the same logical group ordered by date.
     */
    public List<EventDto> getEventsByGroupId(String groupId) {
        return eventRepository.findByGroupIdOrderByStartDateAsc(groupId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Validates the event payload before it is persisted.
     */
    private void validateEvent(EventDto eventDto) {
        if (eventDto.getStartDate() != null && eventDto.getEndDate() != null) {
            if (eventDto.getStartDate().isAfter(eventDto.getEndDate())) {
                throw new BadRequestException("Start date cannot be after end date");
            }
        }
        if (eventDto.getShowTimes() == null || eventDto.getShowTimes().isEmpty()) {
            throw new BadRequestException("At least one show time must be specified");
        }
        if (eventDto.getPrice() == null || eventDto.getPrice().signum() < 0) {
            throw new BadRequestException("Event price must be zero or greater.");
        }
        if (eventDto.getTitle() == null || eventDto.getTitle().trim().isEmpty()) {
            throw new BadRequestException("Event title is required.");
        }
    }

    /**
     * Creates a new event and stamps the authenticated admin as organizer.
     */
    public EventDto createEvent(EventDto eventDto) {
        validateEvent(eventDto);
        Event event = mapToEntity(eventDto);

        if (event.getGroupId() == null || event.getGroupId().isEmpty()) {
            event.setGroupId(UUID.randomUUID().toString());
        }
        if (event.getSections() != null) {
            event.getSections().forEach(section -> section.setEvent(event));
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User user) {
            event.setOrganizer(user);
        }

        Event savedEvent = eventRepository.save(event);
        return mapToDto(savedEvent);
    }

    /**
     * Updates an existing event and replaces any supplied section definition.
     */
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

    /**
     * Deletes an event by ID after verifying it exists.
     */
    public void deleteEvent(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));
        eventRepository.delete(event);
    }

    /**
     * Searches the public catalogue by category while preserving grouped results.
     */
    public List<EventDto> searchEvents(String category) {
        return eventRepository.findUniqueEventsByCategory(category).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Maps the event entity into the API DTO consumed by the frontend.
     */
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

    /**
     * Maps an event section entity into its API DTO representation.
     */
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

    /**
     * Builds a new event entity tree from the request DTO.
     */
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

    /**
     * Maps a section DTO to the entity model attached to an event.
     */
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
