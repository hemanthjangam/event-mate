package com.hemanthjangam.event_mate.service;

import com.hemanthjangam.event_mate.entity.SeatingLayout;
import com.hemanthjangam.event_mate.exception.BadRequestException;
import com.hemanthjangam.event_mate.exception.ResourceNotFoundException;
import com.hemanthjangam.event_mate.repository.SeatingLayoutRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SeatingLayoutService {

    private final SeatingLayoutRepository repository;

    /**
     * Creates a reusable seating layout after validating uniqueness and
     * dimensions.
     */
    public SeatingLayout createLayout(SeatingLayout layout) {
        validateLayout(layout);
        if (repository.existsByName(layout.getName().trim())) {
            throw new BadRequestException("A seating layout with this name already exists.");
        }
        layout.setName(layout.getName().trim());
        return repository.save(java.util.Objects.requireNonNull(layout));
    }

    /**
     * Returns every reusable seating layout.
     */
    public List<SeatingLayout> getAllLayouts() {
        return repository.findAll();
    }

    /**
     * Loads a seating layout by ID.
     */
    public SeatingLayout getLayoutById(Long id) {
        return repository.findById(java.util.Objects.requireNonNull(id))
                .orElseThrow(() -> new ResourceNotFoundException("Layout not found"));
    }

    /**
     * Deletes a layout after verifying it exists.
     */
    public void deleteLayout(Long id) {
        SeatingLayout layout = getLayoutById(id);
        repository.delete(layout);
    }

    /**
     * Validates the required layout fields before persistence.
     */
    private void validateLayout(SeatingLayout layout) {
        if (layout == null) {
            throw new BadRequestException("Layout payload is required.");
        }
        if (layout.getName() == null || layout.getName().trim().isEmpty()) {
            throw new BadRequestException("Layout name is required.");
        }
        if (layout.getTotalRows() <= 0 || layout.getTotalCols() <= 0) {
            throw new BadRequestException("Layout dimensions must be greater than zero.");
        }
        if (layout.getConfig() == null || layout.getConfig().trim().isEmpty()) {
            throw new BadRequestException("Layout configuration is required.");
        }
    }
}
