package com.hemanthjangam.event_mate.config;

import com.hemanthjangam.event_mate.entity.SeatingLayout;
import com.hemanthjangam.event_mate.repository.SeatingLayoutRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {

    /**
     * Seeds reusable layouts, sample events, and event sections for local
     * development.
     */
    @Bean
    CommandLineRunner initLayouts(SeatingLayoutRepository layoutRepository,
            com.hemanthjangam.event_mate.repository.EventRepository eventRepository,
            com.hemanthjangam.event_mate.repository.EventSectionRepository sectionRepository,
            org.springframework.transaction.support.TransactionTemplate transactionTemplate) {
        return args -> transactionTemplate.execute(status -> {
            seedLayouts(layoutRepository);
            seedEvents(eventRepository);
            backfillMissingSections(eventRepository, sectionRepository);
            fixBrokenEventImageUrls(eventRepository);
            return null;
        });
    }

    /**
     * Inserts the default seating layouts used by the admin UI and demo events.
     */
    private void seedLayouts(SeatingLayoutRepository layoutRepository) {
        if (!layoutRepository.existsByName("Standard Theatre")) {
            layoutRepository.save(SeatingLayout.builder()
                    .name("Standard Theatre")
                    .totalRows(20)
                    .totalCols(20)
                    .config("[{\"name\":\"Premium\",\"rows\":5,\"cols\":20,\"priceMultiplier\":1.5},{\"name\":\"Standard\",\"rows\":15,\"cols\":20,\"priceMultiplier\":1.0}]")
                    .build());
        }

        if (!layoutRepository.existsByName("IMAX Hall")) {
            layoutRepository.save(SeatingLayout.builder()
                    .name("IMAX Hall")
                    .totalRows(25)
                    .totalCols(30)
                    .config("[{\"name\":\"VIP\",\"rows\":5,\"cols\":30,\"priceMultiplier\":2.0},{\"name\":\"Premium\",\"rows\":10,\"cols\":30,\"priceMultiplier\":1.5},{\"name\":\"Standard\",\"rows\":10,\"cols\":30,\"priceMultiplier\":1.2}]")
                    .build());
        }

        if (!layoutRepository.existsByName("Small Screen")) {
            layoutRepository.save(SeatingLayout.builder()
                    .name("Small Screen")
                    .totalRows(10)
                    .totalCols(15)
                    .config("[{\"name\":\"General\",\"rows\":10,\"cols\":15,\"priceMultiplier\":1.0}]")
                    .build());
        }
    }

    /**
     * Seeds a handful of starter events for local development and demos.
     */
    private void seedEvents(com.hemanthjangam.event_mate.repository.EventRepository eventRepository) {
        if (!eventRepository.existsByTitle("Inception")) {
            eventRepository.save(com.hemanthjangam.event_mate.entity.Event.builder()
                    .title("Inception")
                    .description("A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.")
                    .venue("IMAX Cinema, Bangalore")
                    .startDate(java.time.LocalDate.now().plusDays(2))
                    .endDate(java.time.LocalDate.now().plusDays(7))
                    .showTimes(java.util.List.of(java.time.LocalTime.of(10, 0),
                            java.time.LocalTime.of(14, 0),
                            java.time.LocalTime.of(18, 0)))
                    .price(new java.math.BigDecimal("450.00"))
                    .category("Movies")
                    .imageUrl("https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2525&auto=format&fit=crop")
                    .trailerUrl("https://www.youtube.com/watch?v=YoHD9XEInc0")
                    .duration(148)
                    .build());
        }

        if (!eventRepository.existsByTitle("Coldplay Live")) {
            eventRepository.save(com.hemanthjangam.event_mate.entity.Event.builder()
                    .title("Coldplay Live")
                    .description("Experience the magic of Coldplay live in concert with their Music of the Spheres World Tour.")
                    .venue("Stadium Arena, Mumbai")
                    .startDate(java.time.LocalDate.now().plusDays(5))
                    .endDate(java.time.LocalDate.now().plusDays(5))
                    .showTimes(java.util.List.of(java.time.LocalTime.of(19, 0)))
                    .price(new java.math.BigDecimal("2500.00"))
                    .category("Concerts")
                    .imageUrl("https://images.unsplash.com/photo-1459749411177-2a254188c885?q=80&w=2670&auto=format&fit=crop")
                    .trailerUrl("https://www.youtube.com/watch?v=3lfnR7OhZY8")
                    .duration(180)
                    .build());
        }

        if (!eventRepository.existsByTitle("Standup Special")) {
            eventRepository.save(com.hemanthjangam.event_mate.entity.Event.builder()
                    .title("Standup Special")
                    .description("An evening of laughter with the country's top comedians.")
                    .venue("Comedy Club, Delhi")
                    .startDate(java.time.LocalDate.now().plusDays(3))
                    .endDate(java.time.LocalDate.now().plusDays(3))
                    .showTimes(java.util.List.of(java.time.LocalTime.of(20, 0)))
                    .price(new java.math.BigDecimal("999.00"))
                    .category("Comedy")
                    .imageUrl("https://images.unsplash.com/photo-1585699324551-f6c309eedeca?q=80&w=2670&auto=format&fit=crop")
                    .duration(120)
                    .build());
        }
    }

    /**
     * Ensures each event has at least one seating section so bookings work out of
     * the box.
     */
    private void backfillMissingSections(
            com.hemanthjangam.event_mate.repository.EventRepository eventRepository,
            com.hemanthjangam.event_mate.repository.EventSectionRepository sectionRepository) {
        boolean sectionsAdded = false;
        for (com.hemanthjangam.event_mate.entity.Event event : eventRepository.findAll()) {
            if (event.getSections() != null && !event.getSections().isEmpty()) {
                continue;
            }

            if (event.getTitle().contains("Inception") || event.getVenue().contains("IMAX")) {
                sectionRepository.save(com.hemanthjangam.event_mate.entity.EventSection.builder()
                        .name("IMAX VIP")
                        .price(event.getPrice().multiply(new java.math.BigDecimal("1.5")))
                        .rows(5)
                        .cols(30)
                        .event(event)
                        .layoutConfig("[{\"name\":\"VIP\",\"rows\":5,\"cols\":30,\"priceMultiplier\":1.5}]")
                        .build());
                sectionRepository.save(com.hemanthjangam.event_mate.entity.EventSection.builder()
                        .name("IMAX Standard")
                        .price(event.getPrice())
                        .rows(15)
                        .cols(30)
                        .event(event)
                        .layoutConfig("[{\"name\":\"Standard\",\"rows\":15,\"cols\":30,\"priceMultiplier\":1.0}]")
                        .build());
            } else {
                sectionRepository.save(com.hemanthjangam.event_mate.entity.EventSection.builder()
                        .name("General")
                        .price(event.getPrice())
                        .rows(20)
                        .cols(20)
                        .event(event)
                        .layoutConfig("[{\"name\":\"General\",\"rows\":20,\"cols\":20,\"priceMultiplier\":1.0}]")
                        .build());
            }
            sectionsAdded = true;
        }

        if (sectionsAdded) {
            System.out.println("Backfilled missing event sections.");
        }
    }

    /**
     * Replaces known broken image URLs so the seeded catalogue renders cleanly in
     * development.
     */
    private void fixBrokenEventImageUrls(com.hemanthjangam.event_mate.repository.EventRepository eventRepository) {
        boolean updated = false;
        for (com.hemanthjangam.event_mate.entity.Event event : eventRepository.findAll()) {
            if (event.getImageUrl() == null
                    || (!event.getImageUrl().contains("share.google")
                            && !event.getImageUrl().contains("encrypted-tbn3.gstatic.com")
                            && !event.getImageUrl().contains("wikipedia.org"))) {
                continue;
            }

            if ("Concerts".equalsIgnoreCase(event.getCategory())) {
                event.setImageUrl("https://images.unsplash.com/photo-1459749411177-2a254188c885?q=80&w=2670&auto=format&fit=crop");
            } else if ("Comedy".equalsIgnoreCase(event.getCategory())) {
                event.setImageUrl("https://images.unsplash.com/photo-1585699324551-f6c309eedeca?q=80&w=2670&auto=format&fit=crop");
            } else {
                event.setImageUrl("https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2525&auto=format&fit=crop");
            }
            eventRepository.save(event);
            updated = true;
        }

        if (updated) {
            System.out.println("Fixed broken event image URLs.");
        }
    }
}
