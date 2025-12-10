package com.hemanthjangam.event_mate.repository;

import com.hemanthjangam.event_mate.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByEventId(Long eventId);
}
