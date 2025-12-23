package com.hemanthjangam.event_mate.repository;

import com.hemanthjangam.event_mate.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    boolean existsByBooking_Event_IdAndBooking_ShowDateAndSection_IdAndRowNumberAndColNumber(Long eventId,
            java.time.LocalDateTime showDate, Long sectionId, int rowNumber, int colNumber);

    java.util.List<Ticket> findByBooking_Event_IdAndBooking_ShowDate(Long eventId, java.time.LocalDateTime showDate);

    java.util.List<Ticket> findByBooking_Event_Id(Long eventId);
}
