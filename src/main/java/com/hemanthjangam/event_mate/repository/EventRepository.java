package com.hemanthjangam.event_mate.repository;

import com.hemanthjangam.event_mate.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByStartDateAfter(java.time.LocalDate date);

    List<Event> findByCategory(String category);

    // Fetch all events belonging to the same group, ordered by date
    List<Event> findByGroupIdOrderByStartDateAsc(String groupId);

    // Fetch one event per group (for the home page display)
    // This query selects the event with the minimum ID for each groupId, PLUS all
    // events with null groupId
    @org.springframework.data.jpa.repository.Query("SELECT e FROM Event e WHERE e.groupId IS NULL OR e.id IN (SELECT MIN(e2.id) FROM Event e2 WHERE e2.groupId IS NOT NULL GROUP BY e2.groupId)")
    List<Event> findUniqueEventsByGroupId();

    // Fetch one event per group filtered by category
    @org.springframework.data.jpa.repository.Query("SELECT e FROM Event e WHERE e.category = ?1 AND (e.groupId IS NULL OR e.id IN (SELECT MIN(e2.id) FROM Event e2 WHERE e2.groupId IS NOT NULL GROUP BY e2.groupId))")
    List<Event> findUniqueEventsByCategory(String category);

    boolean existsByTitle(String title);
}
