package com.hemanthjangam.event_mate.controller;

import com.hemanthjangam.event_mate.dto.EventDto;
import com.hemanthjangam.event_mate.service.EventService;
import lombok.RequiredArgsConstructor;
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

    @GetMapping("/{id}")
    public ResponseEntity<EventDto> getEventById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EventDto> createEvent(@RequestBody EventDto eventDto) {
        return ResponseEntity.ok(eventService.createEvent(eventDto));
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
