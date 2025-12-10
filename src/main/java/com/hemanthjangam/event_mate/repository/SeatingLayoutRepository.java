package com.hemanthjangam.event_mate.repository;

import com.hemanthjangam.event_mate.entity.SeatingLayout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SeatingLayoutRepository extends JpaRepository<SeatingLayout, Long> {
}
