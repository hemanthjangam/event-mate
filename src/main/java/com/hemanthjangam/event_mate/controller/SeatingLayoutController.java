package com.hemanthjangam.event_mate.controller;

import com.hemanthjangam.event_mate.entity.SeatingLayout;
import com.hemanthjangam.event_mate.service.SeatingLayoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seating-layouts")
@RequiredArgsConstructor
public class SeatingLayoutController {

    private final SeatingLayoutService service;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SeatingLayout> createLayout(@RequestBody SeatingLayout layout) {
        return ResponseEntity.ok(service.createLayout(layout));
    }

    @GetMapping
    public ResponseEntity<List<SeatingLayout>> getAllLayouts() {
        return ResponseEntity.ok(service.getAllLayouts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SeatingLayout> getLayoutById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getLayoutById(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteLayout(@PathVariable Long id) {
        service.deleteLayout(id);
        return ResponseEntity.noContent().build();
    }
}
