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
        private final EmailService emailService;

        @Transactional
        public BookingDto.BookingResponse createBooking(BookingDto.BookingRequest request) {
                String email = SecurityContextHolder.getContext().getAuthentication().getName();
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "User not found with email: " + email));

                Event event = eventRepository.findById(java.util.Objects.requireNonNull(request.getEventId()))
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Event not found with id: " + request.getEventId()));

                BigDecimal totalAmount = BigDecimal.ZERO;
                List<Ticket> tickets = new ArrayList<>();

                if (request.getShowDate() == null) {
                        throw new BadRequestException("Show date is required.");
                }

                // Validate Show Date
                java.time.LocalDate showLocalDate = request.getShowDate().toLocalDate();
                java.time.LocalTime showLocalTime = request.getShowDate().toLocalTime();

                if (showLocalDate.isBefore(event.getStartDate()) || showLocalDate.isAfter(event.getEndDate())) {
                        System.err.println("Booking Check Fail: Date " + showLocalDate + " not in "
                                        + event.getStartDate() + " - " + event.getEndDate());
                        throw new BadRequestException("Show date is not within the event range.");
                }

                if (event.getShowTimes() == null
                                || event.getShowTimes().stream().noneMatch(t -> t.equals(showLocalTime))) {
                        System.err.println("Booking Check Fail: Time " + showLocalTime + " not found in "
                                        + event.getShowTimes());
                        throw new BadRequestException("Invalid show time selected.");
                }

                for (BookingDto.TicketRequest ticketReq : request.getTickets()) {
                        EventSection section = eventSectionRepository
                                        .findById(java.util.Objects.requireNonNull(ticketReq.getSectionId()))
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                        "Section not found with id: " + ticketReq.getSectionId()));

                        if (ticketRepository
                                        .existsByBooking_Event_IdAndBooking_ShowDateAndSection_IdAndRowNumberAndColNumber(
                                                        event.getId(), request.getShowDate(), section.getId(),
                                                        ticketReq.getRow(), ticketReq.getCol())) {
                                throw new BadRequestException(
                                                "Seat already booked for this date: " + section.getName() + " Row "
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

                // Initially set payment status as PENDING
                Booking booking = Booking.builder()
                                .user(user)
                                .event(event)
                                .bookingDate(LocalDateTime.now())
                                .showDate(request.getShowDate())
                                .paymentStatus(PaymentStatus.PENDING)
                                .totalAmount(totalAmount)
                                .build();

                Booking finalBooking = booking;
                tickets.forEach(t -> t.setBooking(finalBooking));

                booking.setTickets(tickets);

                Booking savedBooking = bookingRepository.save(booking);

                return mapToResponse(savedBooking, totalAmount);
        }

        @Transactional
        public void confirmBookingPayment(Long bookingId, String paymentMethod) {
                Booking booking = bookingRepository.findById(java.util.Objects.requireNonNull(bookingId))
                                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

                booking.setPaymentStatus(PaymentStatus.COMPLETED);
                bookingRepository.save(booking);

                Payment payment = Payment.builder()
                                .booking(booking)
                                .amount(booking.getTotalAmount())
                                .method(paymentMethod)
                                .status(PaymentStatus.COMPLETED)
                                .paymentDate(LocalDateTime.now())
                                .build();

                paymentRepository.save(java.util.Objects.requireNonNull(payment));

                User user = booking.getUser();
                Event event = booking.getEvent();

                emailService.sendEmail(
                                user.getEmail(),
                                "Booking Confirmation - " + event.getTitle(),
                                "Hi " + user.getName() + ",\n\n" +
                                                "Your booking for " + event.getTitle()
                                                + " has been confirmed!\n\n" +
                                                "Booking ID: " + booking.getId() + "\n" +
                                                "Show Date: " + booking.getShowDate() + "\n" +
                                                "Venue: " + event.getVenue() + "\n" +
                                                "Seats: "
                                                + booking.getTickets().stream().map(Ticket::getSeatNo)
                                                                .collect(Collectors.joining(", "))
                                                + "\n" +
                                                "Total Amount: $" + booking.getTotalAmount() + "\n\n" +
                                                "Enjoy the event!\n\nThe Event Mate Team");
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
                                .showDate(booking.getShowDate())
                                .paymentStatus(booking.getPaymentStatus().name())
                                .totalAmount(totalAmount)
                                .tickets(booking.getTickets().stream().map(Ticket::getSeatNo)
                                                .collect(Collectors.toList()))
                                .customerName(booking.getUser().getName())
                                .customerEmail(booking.getUser().getEmail())
                                .build();
        }

        public List<String> getBookedSeats(Long eventId) {
                // Seat availability depends on date/time.
                throw new BadRequestException("Show date is required to fetch booked seats.");
        }

        public List<String> getBookedSeats(Long eventId, LocalDateTime showDate) {
                return ticketRepository.findByBooking_Event_IdAndBooking_ShowDate(eventId, showDate).stream()
                                .map(ticket -> ticket.getSection().getName() + "-" + ticket.getRowNumber() + "-"
                                                + ticket.getColNumber())
                                .collect(Collectors.toList());
        }

        public List<BookingDto.BookingResponse> getOrganizerBookings() {
                String email = SecurityContextHolder.getContext().getAuthentication().getName();
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "User not found with email: " + email));

                return bookingRepository.findByEventOrganizer(user).stream()
                                .map(booking -> {
                                        BigDecimal total = booking.getEvent().getPrice()
                                                        .multiply(BigDecimal.valueOf(booking.getTickets().size()));
                                        return mapToResponse(booking, total);
                                })
                                .collect(Collectors.toList());
        }

        public List<BookingDto.BookingResponse> getAllBookings() {
                return bookingRepository.findAll().stream()
                                .map(booking -> {
                                        BigDecimal total = booking.getEvent().getPrice()
                                                        .multiply(BigDecimal.valueOf(booking.getTickets().size()));
                                        return mapToResponse(booking, total);
                                })
                                .collect(Collectors.toList());
        }

        public BookingDto.BookingResponse getBookingById(Long bookingId) {
                Booking booking = bookingRepository.findById(java.util.Objects.requireNonNull(bookingId))
                                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

                // Optional: Check if current user owns this booking or is admin/organizer
                // For now allowing access for flow simplicity, but ideally should secure this.

                BigDecimal total = booking.getEvent().getPrice()
                                .multiply(BigDecimal.valueOf(booking.getTickets().size()));
                return mapToResponse(booking, total);
        }
}
