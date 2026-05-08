-- Flyway Migration V1: Initial EventMate database schema
-- Purpose: Create the base tables used by the Spring Boot JPA entities.

-- Stores application users. Spring Security reads email/password/role from here.
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50),
    active BOOLEAN NOT NULL DEFAULT true,
    otp VARCHAR(255),
    otp_expiry TIMESTAMP
);

-- Stores reusable seating layout templates that can be applied to events.
CREATE TABLE seating_layouts (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    total_rows INTEGER NOT NULL,
    total_cols INTEGER NOT NULL,
    config TEXT
);

-- Stores event/movie metadata, scheduling range, organizer, and display details.
CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2000),
    venue VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    price NUMERIC(19, 2) NOT NULL,
    image_url VARCHAR(255),
    category VARCHAR(255),
    trailer_url VARCHAR(255),
    duration INTEGER,
    censor_rating VARCHAR(255),
    organizer_id BIGINT,
    group_id VARCHAR(255),
    imdb_rating DOUBLE PRECISION,
    movie_mode VARCHAR(255),
    CONSTRAINT fk_events_organizer
        FOREIGN KEY (organizer_id) REFERENCES users(id)
);

-- Stores the daily show times available for an event between start_date and end_date.
CREATE TABLE event_show_times (
    event_id BIGINT NOT NULL,
    show_time TIME,
    CONSTRAINT fk_event_show_times_event
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Stores additional media/image URLs for an event.
CREATE TABLE event_media_urls (
    event_id BIGINT NOT NULL,
    media_urls VARCHAR(255),
    CONSTRAINT fk_event_media_urls_event
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Stores cast names for movie-type events.
CREATE TABLE event_cast (
    event_id BIGINT NOT NULL,
    cast_name VARCHAR(255),
    CONSTRAINT fk_event_cast_event
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Stores seat sections for an event, such as VIP, Gold, or Silver.
CREATE TABLE event_sections (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price NUMERIC(19, 2) NOT NULL,
    rows INTEGER NOT NULL,
    cols INTEGER NOT NULL,
    event_id BIGINT NOT NULL,
    layout_config TEXT,
    CONSTRAINT fk_event_sections_event
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Stores a user's booking for one event show. Seats are stored separately in tickets.
CREATE TABLE bookings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,
    booking_date TIMESTAMP NOT NULL,
    show_date TIMESTAMP,
    payment_status VARCHAR(50),
    total_amount NUMERIC(19, 2) NOT NULL,
    CONSTRAINT fk_bookings_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_bookings_event
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Stores individual seats selected within a booking.
CREATE TABLE tickets (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,
    show_date TIMESTAMP NOT NULL,
    seat_no VARCHAR(255) NOT NULL,
    row_number INTEGER NOT NULL,
    col_number INTEGER NOT NULL,
    section_id BIGINT NOT NULL,
    price NUMERIC(19, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    CONSTRAINT fk_tickets_booking
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    CONSTRAINT fk_tickets_event
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    CONSTRAINT fk_tickets_section
        FOREIGN KEY (section_id) REFERENCES event_sections(id)
);

-- Stores payment records for bookings. One booking can have only one payment record.
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL UNIQUE,
    amount NUMERIC(19, 2) NOT NULL,
    method VARCHAR(255) NOT NULL,
    status VARCHAR(50),
    payment_date TIMESTAMP,
    CONSTRAINT fk_payments_booking
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- Stores user-facing notifications.
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    message VARCHAR(255) NOT NULL,
    read BOOLEAN NOT NULL DEFAULT false,
    sent_at TIMESTAMP,
    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Stores user reviews and ratings for events.
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,
    rating INTEGER NOT NULL,
    comment VARCHAR(1000),
    created_at TIMESTAMP,
    CONSTRAINT fk_reviews_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_event
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    CONSTRAINT chk_reviews_rating
        CHECK (rating >= 1 AND rating <= 5)
);

-- Lookup and filtering indexes.
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_group_id ON events(group_id);
CREATE INDEX idx_events_organizer_id ON events(organizer_id);

CREATE INDEX idx_event_show_times_event_id ON event_show_times(event_id);
CREATE INDEX idx_event_media_urls_event_id ON event_media_urls(event_id);
CREATE INDEX idx_event_cast_event_id ON event_cast(event_id);

CREATE INDEX idx_event_sections_event_id ON event_sections(event_id);

CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_event_id ON bookings(event_id);
CREATE INDEX idx_bookings_event_show_date ON bookings(event_id, show_date);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);

CREATE INDEX idx_tickets_booking_id ON tickets(booking_id);
CREATE INDEX idx_tickets_event_show_date ON tickets(event_id, show_date);
CREATE INDEX idx_tickets_section_id ON tickets(section_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_seat_lookup ON tickets(section_id, row_number, col_number);
CREATE UNIQUE INDEX idx_unique_ticket_seat
ON tickets(event_id, show_date, section_id, row_number, col_number)
WHERE status = 'BOOKED';

CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read);

CREATE INDEX idx_reviews_event_id ON reviews(event_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);

-- Database-level documentation for tables.
COMMENT ON TABLE users IS 'Application users who can authenticate and book events.';
COMMENT ON TABLE seating_layouts IS 'Reusable seating layout templates stored as JSON configuration.';
COMMENT ON TABLE events IS 'Events or movies available for discovery and booking.';
COMMENT ON TABLE event_show_times IS 'Show times attached to an event.';
COMMENT ON TABLE event_media_urls IS 'Additional media URLs attached to an event.';
COMMENT ON TABLE event_cast IS 'Cast members attached to movie events.';
COMMENT ON TABLE event_sections IS 'Seat sections for an event, including rows, columns, and section pricing.';
COMMENT ON TABLE bookings IS 'User booking records for a selected event and show date.';
COMMENT ON TABLE tickets IS 'Individual booked seats linked to a booking and event section.';
COMMENT ON TABLE payments IS 'Payment information linked one-to-one with a booking.';
COMMENT ON TABLE notifications IS 'Notifications generated for users.';
COMMENT ON TABLE reviews IS 'User ratings and comments for events.';

-- Database-level documentation for important columns.
COMMENT ON COLUMN users.email IS 'Unique login identifier for the user.';
COMMENT ON COLUMN users.password_hash IS 'Hashed password used by Spring Security.';
COMMENT ON COLUMN users.role IS 'Application role, for example CUSTOMER or ADMIN.';
COMMENT ON COLUMN users.active IS 'Controls whether the user account is enabled.';
COMMENT ON COLUMN users.otp IS 'Temporary OTP value used during verification flows.';
COMMENT ON COLUMN users.otp_expiry IS 'Expiry timestamp for the OTP value.';

COMMENT ON COLUMN seating_layouts.total_rows IS 'Number of rows in the reusable layout.';
COMMENT ON COLUMN seating_layouts.total_cols IS 'Number of columns in the reusable layout.';
COMMENT ON COLUMN seating_layouts.config IS 'JSON layout configuration such as gaps or blocked seats.';

COMMENT ON COLUMN events.start_date IS 'First date on which the event can be shown.';
COMMENT ON COLUMN events.end_date IS 'Last date on which the event can be shown.';
COMMENT ON COLUMN events.price IS 'Base event price before section-level pricing is applied.';
COMMENT ON COLUMN events.organizer_id IS 'Admin user who owns or manages the event.';
COMMENT ON COLUMN events.group_id IS 'Groups multiple event rows that represent the same movie or event across dates.';
COMMENT ON COLUMN events.movie_mode IS 'Display mode or format, such as 2D, 3D, IMAX, or similar.';

COMMENT ON COLUMN event_show_times.show_time IS 'One available show time for the linked event.';
COMMENT ON COLUMN event_media_urls.media_urls IS 'Media URL associated with the linked event.';
COMMENT ON COLUMN event_cast.cast_name IS 'Cast member name associated with the linked event.';

COMMENT ON COLUMN event_sections.price IS 'Seat price for this section.';
COMMENT ON COLUMN event_sections.rows IS 'Number of seat rows in this section.';
COMMENT ON COLUMN event_sections.cols IS 'Number of seat columns in this section.';
COMMENT ON COLUMN event_sections.layout_config IS 'JSON section layout configuration.';

COMMENT ON COLUMN bookings.booking_date IS 'Timestamp when the booking was created.';
COMMENT ON COLUMN bookings.show_date IS 'Exact show date and time selected by the user.';
COMMENT ON COLUMN bookings.payment_status IS 'Current payment state of the booking.';
COMMENT ON COLUMN bookings.total_amount IS 'Total amount calculated from all selected tickets.';

COMMENT ON COLUMN tickets.seat_no IS 'Human-readable seat label derived from section, row, and column.';
COMMENT ON COLUMN tickets.event_id IS 'Event copied onto each ticket so the database can enforce unique seats per show.';
COMMENT ON COLUMN tickets.show_date IS 'Show date and time copied onto each ticket for duplicate booking prevention.';
COMMENT ON COLUMN tickets.row_number IS 'Seat row number inside the section.';
COMMENT ON COLUMN tickets.col_number IS 'Seat column number inside the section.';
COMMENT ON COLUMN tickets.status IS 'Ticket state, for example BOOKED, CANCELLED, or USED.';

COMMENT ON COLUMN payments.booking_id IS 'Unique booking linked to this payment record.';
COMMENT ON COLUMN payments.method IS 'Payment method or provider used for checkout.';
COMMENT ON COLUMN payments.status IS 'Payment status stored using the application payment enum values.';
COMMENT ON COLUMN payments.payment_date IS 'Timestamp when payment was completed.';

COMMENT ON COLUMN notifications.read IS 'Whether the notification has been read by the user.';
COMMENT ON COLUMN notifications.sent_at IS 'Timestamp when the notification was sent.';

COMMENT ON COLUMN reviews.rating IS 'User rating between 1 and 5.';
COMMENT ON COLUMN reviews.comment IS 'Optional user review text.';
