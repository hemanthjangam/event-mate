-- Flyway Migration V1: Initial Event Mate Database Schema
-- Created: 2025-12-12
-- Purpose: Create all base tables for Event Mate application

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'CUSTOMER',
    active BOOLEAN DEFAULT true,
    otp VARCHAR(10),
    otp_expiry TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- 2. SEATING_LAYOUTS TABLE
-- ============================================
CREATE TABLE seating_layouts (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    total_rows INTEGER NOT NULL,
    total_cols INTEGER NOT NULL,
    config TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index on name for faster lookups
CREATE INDEX idx_seating_layouts_name ON seating_layouts(name);

-- ============================================
-- 3. EVENTS TABLE
-- ============================================
CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2000),
    venue VARCHAR(255),
    date TIMESTAMP NOT NULL,
    price NUMERIC(19, 2) NOT NULL,
    image_url VARCHAR(500),
    category VARCHAR(100),
    trailer_url VARCHAR(500),
    duration INTEGER,
    censor_rating VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common queries
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_category ON events(category);

-- ============================================
-- 4. EVENTS_MEDIA_URLS TABLE (ElementCollection)
-- ============================================
CREATE TABLE events_media_urls (
    event_id BIGINT NOT NULL,
    media_urls VARCHAR(500),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE INDEX idx_events_media_urls_event_id ON events_media_urls(event_id);

-- ============================================
-- 5. EVENT_SECTIONS TABLE
-- ============================================
CREATE TABLE event_sections (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price NUMERIC(19, 2) NOT NULL,
    rows INTEGER NOT NULL,
    cols INTEGER NOT NULL,
    event_id BIGINT NOT NULL,
    layout_config TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_event_sections_event_id ON event_sections(event_id);
CREATE INDEX idx_event_sections_name ON event_sections(name);

-- ============================================
-- 6. BOOKINGS TABLE
-- ============================================
CREATE TABLE bookings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,
    booking_date TIMESTAMP NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'PENDING',
    total_amount NUMERIC(19, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Indexes for faster queries
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_event_id ON bookings(event_id);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);

-- ============================================
-- 7. TICKETS TABLE
-- ============================================
CREATE TABLE tickets (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    seat_no VARCHAR(50) NOT NULL,
    row_number INTEGER NOT NULL,
    col_number INTEGER NOT NULL,
    section_id BIGINT NOT NULL,
    price NUMERIC(19, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'BOOKED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (section_id) REFERENCES event_sections(id) ON DELETE RESTRICT
);

-- Unique constraint on seat (event + section + row + col)
CREATE INDEX idx_tickets_booking_id ON tickets(booking_id);
CREATE INDEX idx_tickets_section_id ON tickets(section_id);
CREATE INDEX idx_tickets_status ON tickets(status);

-- ============================================
-- 8. PAYMENTS TABLE
-- ============================================
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL UNIQUE,
    amount NUMERIC(19, 2) NOT NULL,
    method VARCHAR(100) NOT NULL,
    status VARCHAR(50),
    payment_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================
-- 9. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    message VARCHAR(1000) NOT NULL,
    read BOOLEAN DEFAULT false,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- ============================================
-- 10. REVIEWS TABLE
-- ============================================
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment VARCHAR(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_event_id ON reviews(event_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- ============================================
-- CONSTRAINTS AND TRIGGERS
-- ============================================

-- Prevent duplicate seat booking (event + section + row + col)
CREATE UNIQUE INDEX idx_unique_seat_booking
ON tickets(booking_id, section_id, row_number, col_number)
WHERE status = 'BOOKED';

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON TABLE users IS 'User accounts for Event Mate application';
COMMENT ON TABLE events IS 'Events available for booking';
COMMENT ON TABLE event_sections IS 'Sections within events (VIP, Gold, Silver, etc.)';
COMMENT ON TABLE bookings IS 'User bookings for events';
COMMENT ON TABLE tickets IS 'Individual tickets within a booking';
COMMENT ON TABLE payments IS 'Payment records for bookings';
COMMENT ON TABLE notifications IS 'User notifications';
COMMENT ON TABLE reviews IS 'User reviews for events';
COMMENT ON TABLE seating_layouts IS 'Reusable seating layout configurations';

-- ============================================
-- ENUM TYPE DEFINITIONS (Optional but recommended for PostgreSQL)
-- ============================================
DO $$ BEGIN
    CREATE TYPE role_enum AS ENUM ('CUSTOMER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_enum AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_status_enum AS ENUM ('BOOKED', 'CANCELLED', 'USED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;