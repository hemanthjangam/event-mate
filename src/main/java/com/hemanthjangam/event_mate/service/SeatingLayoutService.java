package com.hemanthjangam.event_mate.service;

import com.hemanthjangam.event_mate.entity.SeatingLayout;
import com.hemanthjangam.event_mate.repository.SeatingLayoutRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SeatingLayoutService {

    private final SeatingLayoutRepository repository;

    public SeatingLayout createLayout(SeatingLayout layout) {
        return repository.save(java.util.Objects.requireNonNull(layout));
    }

    public List<SeatingLayout> getAllLayouts() {
        return repository.findAll();
    }

    public SeatingLayout getLayoutById(Long id) {
        return repository.findById(java.util.Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Layout not found"));
    }

    public void deleteLayout(Long id) {
        repository.deleteById(java.util.Objects.requireNonNull(id));
    }
}
