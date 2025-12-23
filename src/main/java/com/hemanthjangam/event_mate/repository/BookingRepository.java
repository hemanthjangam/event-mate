package com.hemanthjangam.event_mate.repository;

import com.hemanthjangam.event_mate.entity.Booking;
import com.hemanthjangam.event_mate.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "tickets", "event", "user", "payment" })
    List<Booking> findByUserId(Long userId);

    List<Booking> findByUser(User user);

    List<Booking> findByEventId(Long eventId);

    List<Booking> findByEventIdAndShowDate(Long eventId, java.time.LocalDateTime showDate);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "tickets", "event", "user", "payment" })
    List<Booking> findByEventOrganizer(User organizer);
}
