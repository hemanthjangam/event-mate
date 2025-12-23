package com.hemanthjangam.event_mate.config;

import com.hemanthjangam.event_mate.entity.SeatingLayout;
import com.hemanthjangam.event_mate.repository.SeatingLayoutRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {

        @Bean
        CommandLineRunner initLayouts(SeatingLayoutRepository layoutRepository,
                        com.hemanthjangam.event_mate.repository.EventRepository eventRepository,
                        com.hemanthjangam.event_mate.repository.EventSectionRepository sectionRepository,
                        org.springframework.transaction.support.TransactionTemplate transactionTemplate) {
                return args -> {
                        transactionTemplate.execute(status -> {
                                // Seed Layouts
                                if (!layoutRepository.existsByName("Standard Theatre")) {
                                        SeatingLayout standard = SeatingLayout.builder()
                                                        .name("Standard Theatre")
                                                        .totalRows(20)
                                                        .totalCols(20)
                                                        .config("[{\"name\":\"Premium\",\"rows\":5,\"cols\":20,\"priceMultiplier\":1.5},{\"name\":\"Standard\",\"rows\":15,\"cols\":20,\"priceMultiplier\":1.0}]")
                                                        .build();
                                        layoutRepository.save(standard);
                                }

                                if (!layoutRepository.existsByName("IMAX Hall")) {
                                        SeatingLayout imax = SeatingLayout.builder()
                                                        .name("IMAX Hall")
                                                        .totalRows(25)
                                                        .totalCols(30)
                                                        .config("[{\"name\":\"VIP\",\"rows\":5,\"cols\":30,\"priceMultiplier\":2.0},{\"name\":\"Premium\",\"rows\":10,\"cols\":30,\"priceMultiplier\":1.5},{\"name\":\"Standard\",\"rows\":10,\"cols\":30,\"priceMultiplier\":1.2}]")
                                                        .build();
                                        layoutRepository.save(imax);
                                }

                                if (!layoutRepository.existsByName("Small Screen")) {
                                        SeatingLayout small = SeatingLayout.builder()
                                                        .name("Small Screen")
                                                        .totalRows(10)
                                                        .totalCols(15)
                                                        .config("[{\"name\":\"General\",\"rows\":10,\"cols\":15,\"priceMultiplier\":1.0}]")
                                                        .build();
                                        layoutRepository.save(small);
                                }

                                // Seed Events
                                if (!eventRepository.existsByTitle("Inception")) {
                                        com.hemanthjangam.event_mate.entity.Event movie = com.hemanthjangam.event_mate.entity.Event
                                                        .builder()
                                                        .title("Inception")
                                                        .description(
                                                                        "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.")
                                                        .venue("IMAX Cinema, Bangalore")
                                                        .startDate(java.time.LocalDate.now().plusDays(2))
                                                        .endDate(java.time.LocalDate.now().plusDays(7))
                                                        .showTimes(java.util.List.of(java.time.LocalTime.of(10, 0),
                                                                        java.time.LocalTime.of(14, 0),
                                                                        java.time.LocalTime.of(18, 0)))
                                                        .price(new java.math.BigDecimal("450.00"))
                                                        .category("Movies")
                                                        .imageUrl(
                                                                        "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2525&auto=format&fit=crop")
                                                        .trailerUrl("https://www.youtube.com/watch?v=YoHD9XEInc0")
                                                        .duration(148)
                                                        .build();
                                        eventRepository.save(movie);
                                }

                                if (!eventRepository.existsByTitle("Coldplay Live")) {
                                        com.hemanthjangam.event_mate.entity.Event concert = com.hemanthjangam.event_mate.entity.Event
                                                        .builder()
                                                        .title("Coldplay Live")
                                                        .description(
                                                                        "Experience the magic of Coldplay live in concert with their Music of the Spheres World Tour.")
                                                        .venue("Stadium Arena, Mumbai")
                                                        .startDate(java.time.LocalDate.now().plusDays(5))
                                                        .endDate(java.time.LocalDate.now().plusDays(5))
                                                        .showTimes(java.util.List.of(java.time.LocalTime.of(19, 0)))
                                                        .price(new java.math.BigDecimal("2500.00"))
                                                        .category("Concerts")
                                                        .imageUrl(
                                                                        "https://images.unsplash.com/photo-1459749411177-2a254188c885?q=80&w=2670&auto=format&fit=crop")
                                                        .trailerUrl("https://www.youtube.com/watch?v=3lfnR7OhZY8")
                                                        .duration(180)
                                                        .build();
                                        eventRepository.save(concert);
                                }

                                if (!eventRepository.existsByTitle("Standup Special")) {
                                        com.hemanthjangam.event_mate.entity.Event comedy = com.hemanthjangam.event_mate.entity.Event
                                                        .builder()
                                                        .title("Standup Special")
                                                        .description("An evening of laughter with the country's top comedians.")
                                                        .venue("Comedy Club, Delhi")
                                                        .startDate(java.time.LocalDate.now().plusDays(3))
                                                        .endDate(java.time.LocalDate.now().plusDays(3))
                                                        .showTimes(java.util.List.of(java.time.LocalTime.of(20, 0)))
                                                        .price(new java.math.BigDecimal("999.00"))
                                                        .category("Comedy")
                                                        .imageUrl(
                                                                        "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?q=80&w=2670&auto=format&fit=crop")
                                                        .duration(120)
                                                        .build();
                                        eventRepository.save(comedy);
                                }

                                // Ensure all events have sections
                                if (eventRepository.count() > 0) {
                                        java.util.List<com.hemanthjangam.event_mate.entity.Event> events = eventRepository
                                                        .findAll();
                                        boolean sectionsAdded = false;
                                        for (com.hemanthjangam.event_mate.entity.Event evt : events) {
                                                if (evt.getSections() == null || evt.getSections().isEmpty()) {
                                                        if (evt.getTitle().contains("Inception")
                                                                        || evt.getVenue().contains("IMAX")) {
                                                                com.hemanthjangam.event_mate.entity.EventSection s1 = com.hemanthjangam.event_mate.entity.EventSection
                                                                                .builder()
                                                                                .name("IMAX VIP")
                                                                                .price(evt.getPrice().multiply(
                                                                                                new java.math.BigDecimal(
                                                                                                                "1.5")))
                                                                                .rows(5).cols(30).event(evt)
                                                                                .layoutConfig(
                                                                                                "[{\"name\":\"VIP\",\"rows\":5,\"cols\":30,\"priceMultiplier\":1.5}]")
                                                                                .build();
                                                                com.hemanthjangam.event_mate.entity.EventSection s2 = com.hemanthjangam.event_mate.entity.EventSection
                                                                                .builder()
                                                                                .name("IMAX Standard")
                                                                                .price(evt.getPrice())
                                                                                .rows(15).cols(30).event(evt)
                                                                                .layoutConfig(
                                                                                                "[{\"name\":\"Standard\",\"rows\":15,\"cols\":30,\"priceMultiplier\":1.0}]")
                                                                                .build();
                                                                sectionRepository.save(s1);
                                                                sectionRepository.save(s2);
                                                        } else {
                                                                com.hemanthjangam.event_mate.entity.EventSection s1 = com.hemanthjangam.event_mate.entity.EventSection
                                                                                .builder()
                                                                                .name("General")
                                                                                .price(evt.getPrice())
                                                                                .rows(20).cols(20).event(evt)
                                                                                .layoutConfig(
                                                                                                "[{\"name\":\"General\",\"rows\":20,\"cols\":20,\"priceMultiplier\":1.0}]")
                                                                                .build();
                                                                sectionRepository.save(s1);
                                                        }
                                                        sectionsAdded = true;
                                                }
                                        }
                                        if (sectionsAdded) {
                                                System.out.println("Backfilled missing event sections.");
                                        }
                                } else {
                                        // Fix existing events with bad URLs
                                        java.util.List<com.hemanthjangam.event_mate.entity.Event> events = eventRepository
                                                        .findAll();
                                        boolean updated = false;
                                        for (com.hemanthjangam.event_mate.entity.Event event : events) {
                                                if (event.getImageUrl() != null && (event.getImageUrl()
                                                                .contains("share.google")
                                                                || event.getImageUrl()
                                                                                .contains("encrypted-tbn3.gstatic.com")
                                                                || event.getImageUrl().contains("wikipedia.org"))) {
                                                        // Assign a random valid image based on category or default
                                                        if ("Concerts".equalsIgnoreCase(event.getCategory())) {
                                                                event.setImageUrl(
                                                                                "https://images.unsplash.com/photo-1459749411177-2a254188c885?q=80&w=2670&auto=format&fit=crop");
                                                        } else if ("Comedy".equalsIgnoreCase(event.getCategory())) {
                                                                event.setImageUrl(
                                                                                "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?q=80&w=2670&auto=format&fit=crop");
                                                        } else {
                                                                // Default / Movie
                                                                event.setImageUrl(
                                                                                "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2525&auto=format&fit=crop");
                                                        }
                                                        eventRepository.save(event);
                                                        updated = true;
                                                }
                                        }
                                        if (updated) {
                                                System.out.println("Fixed broken event image URLs.");
                                        }
                                }
                                return null;
                        });
                };
        }
}
