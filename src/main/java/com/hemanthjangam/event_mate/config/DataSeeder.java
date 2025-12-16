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
                        com.hemanthjangam.event_mate.repository.EventRepository eventRepository) {
                return args -> {
                        // Seed Layouts
                        if (layoutRepository.count() == 0) {
                                SeatingLayout standard = SeatingLayout.builder()
                                                .name("Standard Theatre")
                                                .totalRows(20)
                                                .totalCols(20)
                                                .config("[{\"name\":\"Premium\",\"rows\":5,\"cols\":20,\"priceMultiplier\":1.5},{\"name\":\"Standard\",\"rows\":15,\"cols\":20,\"priceMultiplier\":1.0}]")
                                                .build();

                                SeatingLayout imax = SeatingLayout.builder()
                                                .name("IMAX Hall")
                                                .totalRows(25)
                                                .totalCols(30)
                                                .config("[{\"name\":\"VIP\",\"rows\":5,\"cols\":30,\"priceMultiplier\":2.0},{\"name\":\"Premium\",\"rows\":10,\"cols\":30,\"priceMultiplier\":1.5},{\"name\":\"Standard\",\"rows\":10,\"cols\":30,\"priceMultiplier\":1.2}]")
                                                .build();

                                SeatingLayout small = SeatingLayout.builder()
                                                .name("Small Screen")
                                                .totalRows(10)
                                                .totalCols(15)
                                                .config("[{\"name\":\"General\",\"rows\":10,\"cols\":15,\"priceMultiplier\":1.0}]")
                                                .build();

                                layoutRepository.save(standard);
                                layoutRepository.save(imax);
                                layoutRepository.save(small);
                        }

                        // Seed Events
                        if (eventRepository.count() == 0) {
                                com.hemanthjangam.event_mate.entity.Event movie = com.hemanthjangam.event_mate.entity.Event
                                                .builder()
                                                .title("Inception")
                                                .description(
                                                                "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.")
                                                .venue("IMAX Cinema, Bangalore")
                                                .date(java.time.LocalDateTime.now().plusDays(2))
                                                .price(new java.math.BigDecimal("450.00"))
                                                .category("Movies")
                                                .imageUrl(
                                                                "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2525&auto=format&fit=crop")
                                                .trailerUrl("https://www.youtube.com/watch?v=YoHD9XEInc0")
                                                .duration(148)
                                                .build();

                                com.hemanthjangam.event_mate.entity.Event concert = com.hemanthjangam.event_mate.entity.Event
                                                .builder()
                                                .title("Coldplay Live")
                                                .description(
                                                                "Experience the magic of Coldplay live in concert with their Music of the Spheres World Tour.")
                                                .venue("Stadium Arena, Mumbai")
                                                .date(java.time.LocalDateTime.now().plusDays(5))
                                                .price(new java.math.BigDecimal("2500.00"))
                                                .category("Concerts")
                                                .imageUrl(
                                                                "https://images.unsplash.com/photo-1459749411177-2a254188c885?q=80&w=2670&auto=format&fit=crop")
                                                .trailerUrl("https://www.youtube.com/watch?v=3lfnR7OhZY8")
                                                .duration(180)
                                                .build();

                                com.hemanthjangam.event_mate.entity.Event comedy = com.hemanthjangam.event_mate.entity.Event
                                                .builder()
                                                .title("Standup Special")
                                                .description("An evening of laughter with the country's top comedians.")
                                                .venue("Comedy Club, Delhi")
                                                .date(java.time.LocalDateTime.now().plusDays(3))
                                                .price(new java.math.BigDecimal("999.00"))
                                                .category("Comedy")
                                                .imageUrl(
                                                                "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?q=80&w=2670&auto=format&fit=crop")
                                                .duration(120)
                                                .build();

                                eventRepository.save(movie);
                                eventRepository.save(concert);
                                eventRepository.save(comedy);
                        } else {
                                // Fix existing events with bad URLs
                                java.util.List<com.hemanthjangam.event_mate.entity.Event> events = eventRepository
                                                .findAll();
                                boolean updated = false;
                                for (com.hemanthjangam.event_mate.entity.Event event : events) {
                                        if (event.getImageUrl() != null && (event.getImageUrl().contains("share.google")
                                                        || event.getImageUrl().contains("encrypted-tbn3.gstatic.com")
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
                };
        }
}
