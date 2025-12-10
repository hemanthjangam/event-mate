package com.hemanthjangam.event_mate.repository;

import com.hemanthjangam.event_mate.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByDateAfter(LocalDateTime date);

    List<Event> findByCategory(String category);
}
