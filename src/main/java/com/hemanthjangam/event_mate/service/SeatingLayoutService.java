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
        return repository.save(layout);
    }

    public List<SeatingLayout> getAllLayouts() {
        return repository.findAll();
    }

    public SeatingLayout getLayoutById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Layout not found"));
    }

    public void deleteLayout(Long id) {
        repository.deleteById(id);
    }
}
