package com.hemanthjangam.event_mate.service;

import com.hemanthjangam.event_mate.dto.BookingDto;
import com.hemanthjangam.event_mate.entity.Booking;
import com.hemanthjangam.event_mate.entity.Event;
import com.hemanthjangam.event_mate.entity.EventSection;
import com.hemanthjangam.event_mate.entity.Payment;
import com.hemanthjangam.event_mate.entity.PaymentStatus;
import com.hemanthjangam.event_mate.entity.Role;
import com.hemanthjangam.event_mate.entity.Ticket;
import com.hemanthjangam.event_mate.entity.User;
import com.hemanthjangam.event_mate.exception.BadRequestException;
import com.hemanthjangam.event_mate.exception.ResourceNotFoundException;
import com.hemanthjangam.event_mate.repository.BookingRepository;
import com.hemanthjangam.event_mate.repository.EventRepository;
import com.hemanthjangam.event_mate.repository.EventSectionRepository;
import com.hemanthjangam.event_mate.repository.PaymentRepository;
import com.hemanthjangam.event_mate.repository.TicketRepository;
import com.hemanthjangam.event_mate.repository.UserRepository;
import com.stripe.model.checkout.Session;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

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

    /**
     * Creates a pending booking after validating the selected show date and seats.
     */
    @Transactional
    public BookingDto.BookingResponse createBooking(BookingDto.BookingRequest request) {
        User user = getCurrentUser();
        Event event = eventRepository.findById(java.util.Objects.requireNonNull(request.getEventId()))
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + request.getEventId()));

        validateBookingRequest(request, event);

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<Ticket> tickets = new ArrayList<>();
        for (BookingDto.TicketRequest ticketRequest : request.getTickets()) {
            EventSection section = validateAndLoadSection(ticketRequest, event, request.getShowDate());
            totalAmount = totalAmount.add(section.getPrice());
            tickets.add(buildTicket(section, ticketRequest));
        }

        Booking booking = Booking.builder()
                .user(user)
                .event(event)
                .bookingDate(LocalDateTime.now())
                .showDate(request.getShowDate())
                .paymentStatus(PaymentStatus.PENDING)
                .totalAmount(totalAmount)
                .build();

        tickets.forEach(ticket -> ticket.setBooking(booking));
        booking.setTickets(tickets);

        Booking savedBooking = bookingRepository.save(booking);
        return mapToResponse(savedBooking);
    }

    /**
     * Confirms a booking after a successful Stripe checkout session lookup.
     */
    @Transactional
    public void confirmStripeCheckoutSession(Long bookingId, Session session) {
        Booking booking = getAuthorizedPendingBooking(bookingId);
        if (!"paid".equalsIgnoreCase(session.getPaymentStatus())) {
            throw new BadRequestException("Stripe session is not paid.");
        }

        String metadataBookingId = session.getMetadata() != null ? session.getMetadata().get("booking_id") : null;
        if (metadataBookingId == null || !metadataBookingId.equals(bookingId.toString())) {
            throw new BadRequestException("Stripe session does not match the booking.");
        }

        confirmBookingPayment(booking, "STRIPE");
    }

    /**
     * Confirms a booking payment for authorized users and records the payment.
     */
    @Transactional
    public void confirmBookingPayment(Long bookingId, String paymentMethod) {
        Booking booking = getAuthorizedPendingBooking(bookingId);
        confirmBookingPayment(booking, paymentMethod);
    }

    /**
     * Returns the authenticated user's booking history.
     */
    public List<BookingDto.BookingResponse> getUserBookings() {
        User user = getCurrentUser();
        return bookingRepository.findByUserId(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Builds a booking response payload for the frontend.
     */
    private BookingDto.BookingResponse mapToResponse(Booking booking) {
        return BookingDto.BookingResponse.builder()
                .bookingId(booking.getId())
                .eventId(booking.getEvent().getId())
                .eventTitle(booking.getEvent().getTitle())
                .bookingDate(booking.getBookingDate())
                .showDate(booking.getShowDate())
                .paymentStatus(booking.getPaymentStatus().name())
                .totalAmount(booking.getTotalAmount())
                .tickets(booking.getTickets().stream().map(Ticket::getSeatNo).collect(Collectors.toList()))
                .customerName(booking.getUser().getName())
                .customerEmail(booking.getUser().getEmail())
                .build();
    }

    /**
     * Rejects seat lookups that do not provide the exact show date.
     */
    public List<String> getBookedSeats(Long eventId) {
        throw new BadRequestException("Show date is required to fetch booked seats.");
    }

    /**
     * Returns booked seats for a specific event show date and time.
     */
    public List<String> getBookedSeats(Long eventId, LocalDateTime showDate) {
        return ticketRepository.findByBooking_Event_IdAndBooking_ShowDate(eventId, showDate).stream()
                .map(ticket -> ticket.getSection().getName() + "-" + ticket.getRowNumber() + "-" + ticket.getColNumber())
                .collect(Collectors.toList());
    }

    /**
     * Returns bookings for events owned by the authenticated admin.
     */
    public List<BookingDto.BookingResponse> getOrganizerBookings() {
        User user = getCurrentUser();
        return bookingRepository.findByEventOrganizer(user).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Returns every booking record for admin reporting screens.
     */
    public List<BookingDto.BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Returns a booking only when the current user is allowed to inspect it.
     */
    public BookingDto.BookingResponse getBookingById(Long bookingId) {
        return mapToResponse(getAuthorizedBooking(bookingId));
    }

    /**
     * Returns a pending booking only when the current user owns it or has admin
     * access.
     */
    public Booking getAuthorizedPendingBooking(Long bookingId) {
        Booking booking = getAuthorizedBooking(bookingId);
        if (booking.getPaymentStatus() != PaymentStatus.PENDING) {
            throw new BadRequestException("Booking is not pending payment.");
        }
        return booking;
    }

    /**
     * Loads the current authenticated user from the security context.
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new BadRequestException("Authentication is required.");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + authentication.getName()));
    }

    /**
     * Verifies the request payload before any booking records are created.
     */
    private void validateBookingRequest(BookingDto.BookingRequest request, Event event) {
        if (request.getShowDate() == null) {
            throw new BadRequestException("Show date is required.");
        }
        if (request.getTickets() == null || request.getTickets().isEmpty()) {
            throw new BadRequestException("At least one seat must be selected.");
        }

        java.time.LocalDate showLocalDate = request.getShowDate().toLocalDate();
        java.time.LocalTime showLocalTime = request.getShowDate().toLocalTime();

        if (showLocalDate.isBefore(event.getStartDate()) || showLocalDate.isAfter(event.getEndDate())) {
            throw new BadRequestException("Show date is not within the event range.");
        }
        if (event.getShowTimes() == null || event.getShowTimes().stream().noneMatch(showLocalTime::equals)) {
            throw new BadRequestException("Invalid show time selected.");
        }
    }

    /**
     * Ensures the requested seat belongs to the event and is still available.
     */
    private EventSection validateAndLoadSection(BookingDto.TicketRequest ticketRequest, Event event, LocalDateTime showDate) {
        EventSection section = eventSectionRepository.findById(java.util.Objects.requireNonNull(ticketRequest.getSectionId()))
                .orElseThrow(() -> new ResourceNotFoundException("Section not found with id: " + ticketRequest.getSectionId()));

        if (!section.getEvent().getId().equals(event.getId())) {
            throw new BadRequestException("Selected section does not belong to the requested event.");
        }
        if (ticketRequest.getRow() < 1 || ticketRequest.getRow() > section.getRows()
                || ticketRequest.getCol() < 1 || ticketRequest.getCol() > section.getCols()) {
            throw new BadRequestException("Selected seat is outside the section bounds.");
        }
        if (ticketRepository.existsByBooking_Event_IdAndBooking_ShowDateAndSection_IdAndRowNumberAndColNumber(
                event.getId(), showDate, section.getId(), ticketRequest.getRow(), ticketRequest.getCol())) {
            throw new BadRequestException("Seat already booked for this date: " + section.getName()
                    + " Row " + ticketRequest.getRow() + " Col " + ticketRequest.getCol());
        }
        return section;
    }

    /**
     * Creates the seat-level ticket record for the chosen section and coordinates.
     */
    private Ticket buildTicket(EventSection section, BookingDto.TicketRequest ticketRequest) {
        return Ticket.builder()
                .seatNo(section.getName() + "-" + ticketRequest.getRow() + "-" + ticketRequest.getCol())
                .rowNumber(ticketRequest.getRow())
                .colNumber(ticketRequest.getCol())
                .section(section)
                .price(section.getPrice())
                .status(Ticket.TicketStatus.BOOKED)
                .build();
    }

    /**
     * Loads a booking and verifies the current user can access it.
     */
    private Booking getAuthorizedBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(java.util.Objects.requireNonNull(bookingId))
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        User user = getCurrentUser();
        boolean isAdmin = user.getRole() == Role.ADMIN;
        boolean isOwner = booking.getUser().getId().equals(user.getId());
        boolean isOrganizer = booking.getEvent().getOrganizer() != null
                && booking.getEvent().getOrganizer().getId().equals(user.getId());

        if (!isAdmin && !isOwner && !isOrganizer) {
            throw new BadRequestException("You are not allowed to access this booking.");
        }
        return booking;
    }

    /**
     * Persists the completed payment state and sends the booking confirmation
     * email.
     */
    private void confirmBookingPayment(Booking booking, String paymentMethod) {
        if (booking.getPaymentStatus() == PaymentStatus.COMPLETED) {
            return;
        }

        booking.setPaymentStatus(PaymentStatus.COMPLETED);
        bookingRepository.save(booking);

        Payment payment = paymentRepository.findByBookingId(booking.getId())
                .orElse(Payment.builder().booking(booking).build());
        payment.setAmount(booking.getTotalAmount());
        payment.setMethod(paymentMethod);
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setPaymentDate(LocalDateTime.now());
        paymentRepository.save(payment);

        sendBookingConfirmation(booking);
    }

    /**
     * Sends the booking confirmation message after a successful payment.
     */
    private void sendBookingConfirmation(Booking booking) {
        User user = booking.getUser();
        Event event = booking.getEvent();
        emailService.sendEmail(
                user.getEmail(),
                "Booking Confirmation - " + event.getTitle(),
                "Hi " + user.getName() + ",\n\n"
                        + "Your booking for " + event.getTitle() + " has been confirmed!\n\n"
                        + "Booking ID: " + booking.getId() + "\n"
                        + "Show Date: " + booking.getShowDate() + "\n"
                        + "Venue: " + event.getVenue() + "\n"
                        + "Seats: " + booking.getTickets().stream().map(Ticket::getSeatNo).collect(Collectors.joining(", ")) + "\n"
                        + "Total Amount: $" + booking.getTotalAmount() + "\n\n"
                        + "Enjoy the event!\n\nThe Event Mate Team");
    }
}
