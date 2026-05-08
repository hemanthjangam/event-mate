-- Flyway Migration V1: Initial EventMate database schema
-- Purpose: Create the base tables used by the Spring Boot JPA entities.

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

CREATE TABLE seating_layouts (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    total_rows INTEGER NOT NULL,
    total_cols INTEGER NOT NULL,
    config TEXT
);

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

CREATE TABLE event_show_times (
    event_id BIGINT NOT NULL,
    show_time TIME,
    CONSTRAINT fk_event_show_times_event
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE event_media_urls (
    event_id BIGINT NOT NULL,
    media_urls VARCHAR(255),
    CONSTRAINT fk_event_media_urls_event
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE event_cast (
    event_id BIGINT NOT NULL,
    cast_name VARCHAR(255),
    CONSTRAINT fk_event_cast_event
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

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

CREATE TABLE tickets (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    seat_no VARCHAR(255) NOT NULL,
    row_number INTEGER NOT NULL,
    col_number INTEGER NOT NULL,
    section_id BIGINT NOT NULL,
    price NUMERIC(19, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    CONSTRAINT fk_tickets_booking
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    CONSTRAINT fk_tickets_section
        FOREIGN KEY (section_id) REFERENCES event_sections(id)
);

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

CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    message VARCHAR(255) NOT NULL,
    read BOOLEAN NOT NULL DEFAULT false,
    sent_at TIMESTAMP,
    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

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
CREATE INDEX idx_tickets_section_id ON tickets(section_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_seat_lookup ON tickets(section_id, row_number, col_number);

CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read);

CREATE INDEX idx_reviews_event_id ON reviews(event_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
