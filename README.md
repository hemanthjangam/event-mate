# Event Mate

Event Mate is a full-stack event booking platform built with Spring Boot, React, and PostgreSQL. It covers event discovery, seat-based booking, JWT authentication, admin event management, payments, reviews, notifications, and AI-assisted recommendations/chat.

## Features

- Browse and search events by category, title, and groupings
- Register, log in, OTP login, and reset passwords
- Book seats for events with section/layout-based seating
- Manage user profiles and view booking history
- Create and manage events from an admin dashboard
- Handle Stripe-based payment flows
- Submit and view event reviews
- View in-app notifications
- Use AI chat and recommendation endpoints powered by Gemini
- Start with seeded sample events and seating layouts for local development

## Tech Stack

**Backend**

- Java 21
- Spring Boot 3
- Spring Security with JWT
- Spring Data JPA
- Flyway
- PostgreSQL
- Stripe Java SDK

**Frontend**

- React
- React Router
- Axios
- Zustand
- React Hook Form
- Stripe React SDK

## Project Structure

```text
event-mate/
├── src/main/java/...            # Spring Boot backend
├── src/main/resources/          # application.properties + Flyway migrations
├── eventmate-frontend/          # React frontend
├── docker-compose.yml           # PostgreSQL for local development
├── pom.xml                      # Maven backend config
└── mvnw                         # Maven wrapper
```

## Main Modules

- `Auth`: JWT auth, OTP login, password reset
- `Events`: event CRUD, event listing, search, grouping
- `Bookings`: booking creation, confirmation, seat availability
- `Payments`: Stripe payment intent and checkout session APIs
- `Admin`: organizer/admin booking and event management flows
- `Reviews`: post and fetch event reviews
- `Notifications`: fetch and mark notifications as read
- `AI`: chat and recommendation endpoints
- `Seating Layouts`: reusable venue layouts and event sections

## API Overview

Backend routes are exposed under `http://localhost:8080/api`.

Key route groups:

- `/api/auth`
- `/api/events`
- `/api/bookings`
- `/api/payments`
- `/api/users`
- `/api/reviews`
- `/api/notifications`
- `/api/seating-layouts`
- `/api/admin`
- `/api/ai`
- `/api/recommendations`

## Getting Started

### Prerequisites

- Java 21
- Node.js 18+ and npm
- Docker and Docker Compose

### 1. Start PostgreSQL

```bash
docker compose up -d
```

This starts a local PostgreSQL container on port `5432`.

### 2. Configure the backend

The backend reads configuration from [src/main/resources/application.properties](/Users/hemanthjangam/Bunny/Project/event-mate/src/main/resources/application.properties:1).

Before publishing or deploying, replace local placeholder values and move secrets out of source control:

- `application.security.jwt.secret-key`
- `gemini.api.key`
- `stripe.secret.key`
- `spring.mail.username`
- `spring.mail.password`

Recommended approach:

- keep `application.properties` for non-sensitive defaults
- load secrets from environment variables or a local untracked config file

### 3. Run the backend

```bash
./mvnw spring-boot:run
```

The backend runs on `http://localhost:8080`.

On first startup, the app seeds sample seating layouts and events.

### 4. Run the frontend

```bash
cd eventmate-frontend
npm install
npm start
```

The frontend runs on `http://localhost:3000`.

The frontend currently points to the backend at `http://localhost:8080/api` in [eventmate-frontend/src/services/api.js](/Users/hemanthjangam/Bunny/Project/event-mate/eventmate-frontend/src/services/api.js:1).

## Development Notes

- Backend CORS is currently open for local development
- JWT secures protected backend routes
- Flyway is included for database migrations
- JPA is also configured with `ddl-auto=update`
- Stripe and Gemini integrations require valid API keys
- Gmail SMTP is configured in the current local setup for email flows

## Available Scripts

**Backend**

```bash
./mvnw spring-boot:run
./mvnw test
```

**Frontend**

```bash
npm start
npm run build
npm test
```

## Future Improvements

- Move all secrets to environment variables
- Add backend and frontend test coverage
- Add Swagger/OpenAPI documentation
- Add role-based organizer/admin documentation and seed users
- Add CI/CD and deployment instructions

## License

No license has been added yet. If this repository is going public, add a license before publishing.
