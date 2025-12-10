package com.hemanthjangam.event_mate.service;

import com.hemanthjangam.event_mate.dto.BookingDto;
import com.hemanthjangam.event_mate.entity.*;
import com.hemanthjangam.event_mate.repository.BookingRepository;
import com.hemanthjangam.event_mate.repository.EventRepository;
import com.hemanthjangam.event_mate.repository.*;
import com.hemanthjangam.event_mate.entity.EventSection;
import com.hemanthjangam.event_mate.entity.Ticket;
import com.hemanthjangam.event_mate.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.hemanthjangam.event_mate.exception.ResourceNotFoundException;
import com.hemanthjangam.event_mate.exception.BadRequestException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

        private final BookingRepository bookingRepository;
        private final EventRepository eventRepository;
        private final UserRepository userRepository;
        private final PaymentRepository paymentRepository;
        private final EventSectionRepository eventSectionRepository;
        private final TicketRepository ticketRepository;
        private final MockPaymentService paymentService;
        private final EmailService emailService;

        @Transactional
        public BookingDto.BookingResponse createBooking(BookingDto.BookingRequest request) {
                String email = SecurityContextHolder.getContext().getAuthentication().getName();
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "User not found with email: " + email));

                Event event = eventRepository.findById(request.getEventId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Event not found with id: " + request.getEventId()));

                BigDecimal totalAmount = BigDecimal.ZERO;
                List<Ticket> tickets = new ArrayList<>();

                for (BookingDto.TicketRequest ticketReq : request.getTickets()) {
                        EventSection section = eventSectionRepository.findById(ticketReq.getSectionId())
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                        "Section not found with id: " + ticketReq.getSectionId()));

                        if (ticketRepository.existsByBooking_Event_IdAndSection_IdAndRowNumberAndColNumber(
                                        event.getId(), section.getId(), ticketReq.getRow(), ticketReq.getCol())) {
                                throw new BadRequestException("Seat already booked: " + section.getName() + " Row "
                                                + ticketReq.getRow() + " Col " + ticketReq.getCol());
                        }

                        totalAmount = totalAmount.add(section.getPrice());

                        tickets.add(Ticket.builder()
                                        .seatNo(section.getName() + "-" + ticketReq.getRow() + "-" + ticketReq.getCol())
                                        .rowNumber(ticketReq.getRow())
                                        .colNumber(ticketReq.getCol())
                                        .section(section)
                                        .price(section.getPrice())
                                        .status(Ticket.TicketStatus.BOOKED)
                                        .build());
                }

                boolean paymentSuccess = paymentService.processPayment(request.getPaymentMethod(),
                                totalAmount.doubleValue());

                Booking booking = Booking.builder()
                                .user(user)
                                .event(event)
                                .bookingDate(LocalDateTime.now())
                                .paymentStatus(paymentSuccess ? PaymentStatus.COMPLETED : PaymentStatus.FAILED)
                                .totalAmount(totalAmount)
                                .build();

                Booking finalBooking = booking;
                tickets.forEach(t -> t.setBooking(finalBooking));

                booking.setTickets(tickets);

                Booking savedBooking = bookingRepository.save(booking);

                Payment payment = Payment.builder()
                                .booking(savedBooking)
                                .amount(totalAmount)
                                .method(request.getPaymentMethod())
                                .status(savedBooking.getPaymentStatus())
                                .paymentDate(LocalDateTime.now())
                                .build();

                paymentRepository.save(payment);

                if (paymentSuccess) {
                        emailService.sendEmail(
                                        user.getEmail(),
                                        "Booking Confirmation - " + event.getTitle(),
                                        "Hi " + user.getName() + ",\n\n" +
                                                        "Your booking for " + event.getTitle()
                                                        + " has been confirmed!\n\n" +
                                                        "Booking ID: " + savedBooking.getId() + "\n" +
                                                        "Date: " + event.getDate() + "\n" +
                                                        "Venue: " + event.getVenue() + "\n" +
                                                        "Seats: "
                                                        + tickets.stream().map(Ticket::getSeatNo)
                                                                        .collect(Collectors.joining(", "))
                                                        + "\n" +
                                                        "Total Amount: $" + totalAmount + "\n\n" +
                                                        "Enjoy the event!\n\nThe Event Mate Team");
                }

                return mapToResponse(savedBooking, totalAmount);
        }

        public List<BookingDto.BookingResponse> getUserBookings() {
                String email = SecurityContextHolder.getContext().getAuthentication().getName();
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "User not found with email: " + email));

                return bookingRepository.findByUserId(user.getId()).stream()
                                .map(booking -> {
                                        BigDecimal total = booking.getEvent().getPrice()
                                                        .multiply(BigDecimal.valueOf(booking.getTickets().size()));
                                        return mapToResponse(booking, total);
                                })
                                .collect(Collectors.toList());
        }

        private BookingDto.BookingResponse mapToResponse(Booking booking, BigDecimal totalAmount) {
                return BookingDto.BookingResponse.builder()
                                .bookingId(booking.getId())
                                .eventId(booking.getEvent().getId())
                                .eventTitle(booking.getEvent().getTitle())
                                .bookingDate(booking.getBookingDate())
                                .paymentStatus(booking.getPaymentStatus().name())
                                .totalAmount(totalAmount)
                                .tickets(booking.getTickets().stream().map(Ticket::getSeatNo)
                                                .collect(Collectors.toList()))
                                .build();
        }

        public List<String> getBookedSeats(Long eventId) {
                return ticketRepository.findByBooking_Event_Id(eventId).stream()
                                .map(ticket -> ticket.getSection().getName() + "-" + ticket.getRowNumber() + "-"
                                                + ticket.getColNumber())
                                .collect(Collectors.toList());
        }
}
