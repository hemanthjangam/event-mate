
package com.hemanthjangam.event_mate.repository;

import com.hemanthjangam.event_mate.entity.EventSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventSectionRepository extends JpaRepository<EventSection, Long> {
}
