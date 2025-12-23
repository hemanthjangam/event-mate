package com.hemanthjangam.event_mate.controller;

import com.hemanthjangam.event_mate.dto.EventDto;
import com.hemanthjangam.event_mate.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @GetMapping
    public ResponseEntity<List<EventDto>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<EventDto>> getAllEventsAdmin() {
        return ResponseEntity.ok(eventService.getAllEventsAdmin());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventDto> getEventById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<EventDto>> getEventsByGroup(@PathVariable String groupId) {
        return ResponseEntity.ok(eventService.getEventsByGroupId(groupId));
    }

    @PostMapping
    public ResponseEntity<EventDto> createEvent(@RequestBody EventDto eventDto) {
        return new ResponseEntity<>(eventService.createEvent(eventDto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EventDto> updateEvent(@PathVariable Long id, @RequestBody EventDto eventDto) {
        return ResponseEntity.ok(eventService.updateEvent(id, eventDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<EventDto>> searchEvents(@RequestParam String category) {
        return ResponseEntity.ok(eventService.searchEvents(category));
    }
}
