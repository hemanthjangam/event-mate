# Event Mate Project Notes

## Purpose

These notes explain:

- everything implemented in this project
- how the full system works end to end
- Spring Boot from basic to advanced using this project as the reference
- security and RBAC in this codebase
- how the AI integration works
- what is good in the implementation
- what needs improvement if the goal is production-grade quality

This project is a full-stack event booking platform built with:

- Spring Boot 3
- Java 21
- Spring Security
- JWT authentication
- Spring Data JPA
- PostgreSQL
- Flyway
- Stripe
- React
- Gemini API integration

---

## 1. High-Level Project Overview

This application is an event booking platform similar in spirit to BookMyShow.

The system supports:

- user registration and login
- OTP-based login and password reset
- event browsing
- category search
- grouped events and date-wise show selection
- seat-based booking
- payment flow with Stripe
- booking history
- event reviews
- admin dashboard for event management
- seating layout builder
- notifications and emails
- AI chat
- AI-based event recommendations

At a high level, the architecture is:

1. React frontend sends HTTP requests to backend APIs.
2. Spring Boot controllers receive requests.
3. Services run business logic.
4. Repositories query the database.
5. Entities map Java objects to PostgreSQL tables.
6. Responses are returned as JSON to the frontend.

The backend mostly follows this pattern:

`Controller -> Service -> Repository -> Database`

That is a standard layered Spring Boot architecture and it is the right base pattern to master.

---

## 2. Project Structure and Why It Matters

### Backend structure

- `config`:
  security, JWT, bean wiring, seed data
- `controller`:
  REST API endpoints
- `service`:
  business logic
- `repository`:
  data access layer with Spring Data JPA
- `entity`:
  JPA entities mapped to tables
- `dto`:
  request/response contracts
- `exception`:
  centralized error handling

### Frontend structure

- `pages`:
  full page components like Home, Booking, Profile, Admin Dashboard
- `components`:
  reusable UI pieces like Navbar, ChatInterface, EventCard
- `services`:
  API wrappers
- `store`:
  auth state using Zustand

### Why this matters

To master Spring Boot, you must learn to think in layers:

- controllers should stay thin
- services should hold business rules
- repositories should only access data
- entities should model domain relationships
- DTOs should protect your API contract

This project already gives you a strong example of that separation.

---

## 3. Features Implemented in This Project

## 3.1 Authentication and User Management

Implemented features:

- register new user
- login with email and password
- generate OTP
- login with OTP
- reset password using OTP
- JWT token generation
- protected routes for logged-in users
- user profile fetch/update

### Backend flow

`AuthController` exposes:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/otp/generate`
- `POST /api/auth/otp/login`
- `POST /api/auth/reset-password`

`AuthService` handles:

- password hashing with BCrypt
- authentication with `AuthenticationManager`
- user lookup through `UserRepository`
- JWT generation through `JwtService`
- OTP creation and expiry
- sending emails

### Important concepts used

- `PasswordEncoder`
- `AuthenticationManager`
- `DaoAuthenticationProvider`
- `UserDetailsService`
- `UserDetails`
- JWT-based stateless authentication

### What you should learn from this

This is your identity layer. In any serious backend, authentication is not just login. It includes:

- credential storage
- token creation
- token validation
- user lookup
- account state
- alternate login flows
- password recovery

This project already covers all of those basics.

---

## 3.2 JWT Authentication

JWT is central to your security design.

### How it works here

1. User logs in successfully.
2. Backend generates a JWT token.
3. Frontend stores the token in `localStorage`.
4. Axios interceptor adds `Authorization: Bearer <token>` to future requests.
5. `JwtAuthenticationFilter` intercepts incoming requests.
6. It extracts the token and validates it.
7. If valid, Spring Security gets an authenticated user in the `SecurityContext`.

### Key classes

- `JwtService`
- `JwtAuthenticationFilter`
- `SecurityConfig`
- `ApplicationConfig`
- `User`

### Why this is important

This is stateless security.

That means:

- the server does not store session state
- each request carries its own auth proof
- Spring rebuilds the authenticated context from the token on every request

This is one of the most important Spring Security patterns to master.

---

## 3.3 Role-Based Access Control (RBAC)

Your RBAC model currently has two roles:

- `CUSTOMER`
- `ADMIN`

### How roles are represented

In the `User` entity, `role` is stored as an enum.

The `getAuthorities()` method returns:

- `ROLE_CUSTOMER`
- `ROLE_ADMIN`

Spring Security expects authorities in that format when using `hasRole("ADMIN")`.

### How authorization is configured

In `SecurityConfig`:

- `/api/auth/**` is public
- `/api/events/**` is public
- `/api/reviews/event/**` is public
- `/api/bookings/event/*/seats` is public
- `/api/ai/chat` is public
- `/api/admin/**` requires admin role
- `/api/seating-layouts/**` requires authentication
- `/api/ai/recommendations` requires authentication
- everything else requires authentication

### Method-level authorization

Some endpoints also use `@PreAuthorize("hasRole('ADMIN')")`.

This is a stronger, more explicit style because the rule lives on the method itself.

### What RBAC means conceptually

RBAC answers:

- who can access what
- which actions belong to which role
- whether permission is based on role only or ownership too

Examples in this project:

- admin can manage bookings and events
- authenticated users can manage profile and bookings
- public users can browse events

### Current gaps in RBAC

These are important to understand if your goal is mastery:

1. Registration currently accepts a role from the client.
   That means a user could try to register as admin.

2. Event creation endpoint is not protected at the controller route level.
   `POST /api/events` should usually be restricted to admin or organizer.

3. Booking fetch by ID does not verify that the current user owns the booking.

4. Review submission trusts `userId` from the request body.
   A secure design should derive the user from the authenticated principal, not from the client payload.

5. Organizer-specific flows exist in repository/service design, but the role model only contains `CUSTOMER` and `ADMIN`.

### Production-level RBAC mindset

Real RBAC should be designed at three levels:

- route authorization
- service-level authorization
- resource ownership validation

That is how you avoid privilege escalation and data leaks.

---

## 3.4 Event Discovery and Browsing

Implemented features:

- fetch all public events
- fetch all events for admin
- fetch event by ID
- fetch grouped events
- search by category
- show event details page
- multi-day date selection
- showtime selection

### Backend design

`EventController` exposes:

- `GET /api/events`
- `GET /api/events/all`
- `GET /api/events/{id}`
- `GET /api/events/group/{groupId}`
- `GET /api/events/search`
- `POST /api/events`
- `PUT /api/events/{id}`
- `DELETE /api/events/{id}`

`EventService` handles:

- public grouped listing
- admin full listing
- event validation
- event creation/update/delete
- mapping entity to DTO

### Grouping concept

This project has a useful grouping idea:

- public users see one representative event per group
- group detail can show all date variants

That is a smart approach when one event spans multiple dates or show groupings.

### Frontend behavior

- Home page loads events
- category filter uses backend search
- search term is filtered client-side
- EventDetails page builds available dates from `startDate` and `endDate`
- showtimes are displayed per selected day

### Spring Boot lessons here

This module teaches:

- RESTful controller design
- DTO mapping
- custom repository queries
- JPQL for grouped queries
- domain validation inside the service layer

---

## 3.5 Event Creation and Admin Dashboard

Implemented features:

- create events
- edit events
- delete events
- assign categories
- define multiple show times
- add cast list
- add trailer URL
- add rating and metadata
- attach seating layout
- admin dashboard with event table

### Create event flow

Frontend:

- admin opens Create Event page
- form collects title, description, date, price, category, venue, cast, layout, trailer, rating
- selected seating layout is transformed into event sections

Backend:

- `EventController` receives event DTO
- `EventService.createEvent()` validates it
- if group ID is missing, a UUID is generated
- sections are attached to the event and persisted

### Smart design choice

The layout-to-section conversion is a practical design:

- reusable layout templates are stored separately
- actual event sections are generated per event
- each event can then have its own seat pricing and sections

That is better than hardcoding seat maps per event in the frontend only.

---

## 3.6 Seating Layout Management

Implemented features:

- create seating layouts
- save reusable layouts
- define rows/columns
- define named sections
- section price multipliers
- visual grid preview
- preset-based layout creation
- layout management page

### Why this is important

This is not just a UI feature.
It is part of domain modeling.

You modeled:

- a reusable venue-style seat template
- event-specific sections derived from that template

That is exactly how domain modeling should work:

- reusable structure in one entity
- instantiated structure in another entity

### Layout data model

`SeatingLayout` stores:

- name
- total rows
- total cols
- config JSON

The frontend allows:

- presets like small, medium, large
- row range assignment to sections
- visual feedback on the grid

### Advanced note

Right now, layout config is stored as JSON text.
This is practical and flexible, but it shifts validation responsibility to application logic.

At a more advanced level, you would think about:

- JSON schema validation
- explicit section table normalization
- row/column coordinate constraints

---

## 3.7 Seat-Based Booking

Implemented features:

- select date and showtime
- fetch booked seats for a specific show date
- pick seats by section
- section-wise pricing
- max 10 seats per booking
- create pending booking
- view booking history

### Booking flow

1. User opens event detail page.
2. User selects a date and showtime.
3. User goes to booking page.
4. Booking page loads event details.
5. Booking page requests already booked seats for that exact show date.
6. User selects seats from available sections.
7. Frontend builds ticket payload with section, row, column.
8. Backend validates event, date, time, and seat availability.
9. Backend creates a booking with `PENDING` payment status.
10. Backend creates seat-level `Ticket` records.

### Why this design is good

The project stores seat bookings at ticket level, not just as a number of seats.

That means:

- exact seat occupancy is trackable
- future cancellation/use flows are possible
- row/col uniqueness can be validated
- show-date-specific seat occupancy is supported

### Important booking validations already present

- show date is required
- show date must be within event date range
- show time must exist in event show times
- seat cannot already be booked for the same event, date, section, row, and column

### Advanced consistency note

Booking is marked `PENDING` before payment completes.
That is normal for a checkout flow.

But in a production-grade seat reservation system, you also need:

- reservation expiry
- payment timeout cleanup
- concurrency-safe locking
- stronger DB constraints

Without that, simultaneous booking races are still possible under load.

---

## 3.8 Payment Flow with Stripe

Implemented features:

- create Stripe payment intent
- create Stripe checkout session
- redirect user to Stripe checkout
- success/cancel pages in frontend

### Current payment flow in this project

1. Booking is created in pending state.
2. Frontend calculates total seat amount.
3. Frontend asks backend to create Stripe checkout session.
4. Backend creates a session using Stripe SDK.
5. Frontend redirects browser to Stripe URL.

### Stripe integration classes

- `PaymentController`
- `StripeService`

### Important production note

The system currently creates Stripe checkout sessions, but I do not see a webhook-based payment confirmation flow.

There is a `confirmBookingPayment()` method in booking service, but it is not automatically tied to verified Stripe webhook events.

That means true production-grade payment confirmation should be:

1. user pays on Stripe
2. Stripe sends webhook to backend
3. backend verifies signature
4. backend marks booking as completed
5. backend creates payment record
6. backend sends confirmation email

This is one of the biggest next-level improvements for real-world payment reliability.

---

## 3.9 Booking History and User Profile

Implemented features:

- fetch my bookings
- show payment status
- pay pending booking later
- edit profile
- reset password from profile
- view AI recommendations in profile

### Design observation

The Profile page acts as a small user dashboard:

- account information
- bookings
- recommendations
- profile editing
- password reset flow

This is a good UX grouping because it keeps user-related actions in one place.

### Spring concepts involved

- principal-based current user lookup
- authenticated API access
- user-specific repository filtering

---

## 3.10 Reviews

Implemented features:

- add review
- fetch reviews by event
- display average rating on event page

### Review model

Each review stores:

- user
- event
- rating
- comment
- created time

### What this teaches

This is a standard relational design for many-to-one review systems.
It demonstrates:

- how to map `ManyToOne` relationships
- how to build user-facing aggregate UI from simple stored records

### Security note

The review endpoint currently uses `userId` from the request body.
That is convenient for the frontend, but not ideal.

More secure design:

- get the current authenticated user from `SecurityContext`
- ignore any user ID coming from the client

That prevents review spoofing.

---

## 3.11 Notifications and Email

Implemented features:

- notification record storage
- unread notification fetch
- mark notification as read
- email sending for notifications
- welcome email
- OTP email
- password changed email
- booking confirmation email

### Design quality

This project treats notifications as both:

- database records
- email messages

That is good because in real systems, notification is usually multi-channel.

### Email service behavior

If email sending fails, the service logs fallback mock output.

That is a very useful developer-friendly behavior because:

- local development still works
- flows can still be tested without breaking

### Advanced improvement idea

The email service uses `@Async`, but for full production readiness you would also think about:

- queue-based messaging
- retry strategy
- dead-letter handling
- template-based emails

---

## 3.12 AI Chat Integration

Implemented features:

- floating AI chat interface
- backend endpoint for chat
- Gemini prompt generation using current events
- graceful fallback if Gemini quota fails

### Chat flow

1. User types message in chat widget.
2. Frontend posts `{ query }` to `/api/ai/chat`.
3. Backend fetches events from DB.
4. Backend builds a prompt that includes event context.
5. Gemini API is called through Spring `RestClient`.
6. AI response is returned to frontend.

### Why this design is good

The prompt includes live event context from the database.
That means the AI response is grounded in application data instead of being a generic chatbot.

This is a key AI integration principle:

- raw model output is weak
- context-enriched model usage is useful

### AI engineering concept used

This is a simple form of prompt grounding.

You are not doing RAG with embeddings here.
You are doing:

- fetch current business data
- inject business data into prompt
- let model answer using that context

That is often enough for many product use cases.

### Reliability handling

`GeminiService` catches quota and API failures and returns user-friendly responses.

That is important because external AI services are not fully reliable:

- rate limits
- quota exhaustion
- malformed responses
- latency spikes

You handled that reasonably well.

---

## 3.13 AI Recommendations

Implemented features:

- personalized recommendation endpoint
- homepage recommendation section
- profile recommendation tab
- recommendation fallback if AI output fails

### Recommendation flow

1. Backend loads all events.
2. If user is logged in, backend loads booking history.
3. Booking history categories are extracted.
4. Gemini receives event list plus booking history summary.
5. Gemini is asked to return recommended event IDs in exact list format.
6. Backend parses IDs from response using regex.
7. Matching events are returned as DTOs.
8. If parsing fails or history is missing, system falls back to shuffled events.

### Why this is a strong learning example

This flow teaches a real AI application pattern:

- structured prompting
- forcing output format
- parsing LLM output
- validating parsed output against known entities
- fallback logic when the model is unreliable

That is much closer to real product engineering than a toy chatbot.

### Limitation to understand

The recommendation layer is not true ML personalization.
It is prompt-based personalization.

That means:

- easy to build
- flexible
- explainable
- not deterministic
- less scalable than a dedicated ranking system

Still, for an MVP or smart feature, it is a valid and practical architecture.

---

## 4. Database Design and Domain Modeling

The core entities are:

- `User`
- `Event`
- `EventSection`
- `SeatingLayout`
- `Booking`
- `Ticket`
- `Payment`
- `Review`
- `Notification`

### Why the model is good

This schema separates concerns properly:

- user identity is separate from bookings
- event metadata is separate from seat sections
- layout templates are separate from event-specific sections
- booking is separate from ticket
- payment is separate from booking state

That is proper domain modeling, and it matters more than beginners usually realize.

### Key relationships

- one user can have many bookings
- one event can have many bookings
- one event can have many sections
- one booking can have many tickets
- one booking can have one payment
- one event can have many reviews
- one user can have many notifications

### Flyway and schema evolution

The project includes a Flyway migration, which is good because schema should be versioned.

However, JPA `ddl-auto=update` is also enabled.

For learning, that is convenient.
For production, it is better to rely on explicit migrations and avoid automatic schema mutation.

---

## 5. Spring Boot Basics to Advanced Using This Project

## 5.1 Spring Boot Basics

### What Spring Boot gives you

Spring Boot helps you build Java applications faster by providing:

- auto-configuration
- embedded web server
- dependency management
- starter modules
- annotation-driven programming model

In this project, the basic entry point is:

- `EventMateApplication`

### Core annotations you should master

- `@SpringBootApplication`
- `@RestController`
- `@RequestMapping`
- `@GetMapping`
- `@PostMapping`
- `@Service`
- `@Repository`
- `@Entity`
- `@Bean`
- `@Configuration`

### What each means

- `@RestController`:
  class serves HTTP JSON responses
- `@Service`:
  business logic component
- `@Repository`:
  persistence access layer
- `@Entity`:
  maps class to database table
- `@Configuration`:
  Java-based Spring bean config
- `@Bean`:
  manually declares an object managed by Spring

These are foundational. You must know them cold.

---

## 5.2 Dependency Injection

Spring creates and wires objects for you.
This is called dependency injection.

In this codebase, constructor injection is used heavily through Lombok `@RequiredArgsConstructor`.

That means:

- dependencies are explicit
- classes are easier to test
- lifecycle is managed by Spring

Example mental model:

- controller depends on service
- service depends on repository
- repository depends on JPA implementation
- Spring assembles all of it

This is one of the most important architectural ideas in Spring.

---

## 5.3 REST API Design

This project is mostly REST-oriented.

Examples:

- `GET /api/events`
- `POST /api/auth/login`
- `PUT /api/users/profile`
- `DELETE /api/seating-layouts/{id}`

### REST principles visible here

- nouns for resources
- HTTP verbs for action
- JSON request/response payloads
- path variables for IDs
- query params for filtering

### What to improve as you mature

- stronger request validation with Bean Validation annotations
- more consistent error response shape
- better API versioning strategy if product grows

---

## 5.4 DTOs and Why They Matter

DTOs are essential.

Why not directly expose entities?

- entities are database models, not API contracts
- entity structure may change
- you may expose sensitive fields accidentally
- you may create lazy-loading issues

This project uses DTOs for:

- auth
- booking
- event
- review
- user
- Gemini request/response

This is good practice and absolutely worth mastering.

---

## 5.5 Spring Data JPA

Spring Data JPA removes boilerplate DB access.

Instead of writing SQL for every query, you use repositories like:

- `findByUserId`
- `findByEventIdAndShowDate`
- `findByEmail`

Spring generates the queries based on method names.

### Why this matters

For most business apps:

- CRUD is fast to build
- complex joins are manageable
- productivity is high

### What to master next

- derived query methods
- JPQL
- native queries when needed
- pagination
- sorting
- entity graphs
- fetch strategies

This project already includes both derived queries and JPQL.

---

## 5.6 JPA Entity Relationships

To master Spring Boot, you must get comfortable with entity relationships.

This project uses:

- `@ManyToOne`
- `@OneToMany`
- `@OneToOne`
- `@ElementCollection`
- `@Enumerated`

### Why `@ElementCollection` is notable here

You use it for:

- `showTimes`
- `mediaUrls`
- `cast`

That is a valid choice when you need simple value collections tied to a parent entity.

### What to be careful about

- lazy loading
- N+1 query problems
- cascade behavior
- orphan removal
- serialization issues if entities are directly returned

These are advanced JPA topics and are extremely important in real projects.

---

## 5.7 Transactions

`BookingService.createBooking()` is transactional.

That means:

- booking creation
- ticket creation
- seat reservation persistence

are treated as one unit of work.

If a failure happens in the middle, the transaction can roll back.

### Why transactions matter

Without transactions, you risk partial data:

- booking saved but tickets missing
- payment record saved but booking not updated
- inconsistent seat state

Transactions are one of the most important backend consistency tools.

---

## 5.8 Exception Handling

This project uses centralized exception handling with `@ControllerAdvice`.

Handled exception types include:

- `ResourceNotFoundException`
- `BadRequestException`
- `IllegalArgumentException`
- generic `Exception`

### Why this matters

Without centralized handling:

- controllers become noisy
- error responses become inconsistent
- stack traces leak more easily

With centralized handling:

- response format is predictable
- HTTP codes are cleaner
- logging is more controlled

This is a core professional pattern.

---

## 5.9 Spring Security

Spring Security is one of the most important advanced parts of Spring Boot.

In this project, it covers:

- request authorization
- authentication provider setup
- password hashing
- JWT filter
- stateless sessions
- role-based access control

### Security chain concept

Every request passes through a filter chain.

Your custom JWT filter is inserted before `UsernamePasswordAuthenticationFilter`.

That is how token-based authentication is integrated into Spring Security.

### Must-master concepts

- `SecurityFilterChain`
- `Authentication`
- `SecurityContextHolder`
- `AuthenticationProvider`
- `UserDetailsService`
- `PasswordEncoder`
- custom authentication filter

If you master these concepts using this project, your Spring Security understanding becomes practical, not theoretical.

---

## 5.10 External API Integration

The Gemini integration teaches external API design in Spring Boot.

### Important ideas shown here

- config-driven API URL and API key
- request DTOs
- response DTOs
- HTTP client usage with `RestClient`
- error status inspection
- user-friendly fallback behavior

### Why this is a valuable skill

Most real backend systems integrate with:

- payment gateways
- AI APIs
- email systems
- internal services
- analytics platforms

If you can build robust external API integrations, you are already operating above beginner level.

---

## 5.11 Configuration Management

This project uses:

- `application.properties`
- `.env`
- `@Value`

for externalized configuration.

### Good pattern already present

Secrets are not hardcoded in Java source.
Instead they come from configuration:

- JWT secret
- Gemini API key
- Stripe key
- mail username/password

### What to master next

- `@ConfigurationProperties`
- profile-based configuration
- secrets management for deployment

For larger Spring apps, `@ConfigurationProperties` is cleaner than many `@Value` fields.

---

## 6. How the Frontend and Backend Work Together

The React frontend uses Axios API wrappers.

### API client design

`api.js`:

- sets base URL
- sets content type
- adds token through request interceptor

This is the right place to centralize API behavior.

### Auth state

Zustand store holds:

- current user
- token
- auth status

Frontend route protection is done through `ProtectedRoute`.

### Important architecture lesson

Frontend auth checks are only user experience controls.
Real security always lives in the backend.

A user can bypass hidden buttons in the browser.
They cannot bypass backend authorization if it is implemented correctly.

---

## 7. How the AI Integration Works in Detail

This section is important because AI integration is a major implemented feature.

## 7.1 Chat flow in detail

Frontend:

- user types a message in the floating chat widget
- frontend sends request to `/api/ai/chat`

Backend:

- controller extracts the query
- all events are loaded
- `GeminiService.getChatResponse()` converts events into plain-language context
- prompt is generated with:
  - platform identity
  - available events
  - user query
  - response instructions
- `generateContent()` sends JSON to Gemini endpoint
- response text is extracted from Gemini response structure
- returned to frontend

### What this pattern is called

This is prompt grounding with live business context.

It is not a vector search system.
It is not a fine-tuned model.

It is:

- application data retrieval
- prompt composition
- LLM completion

This is a good practical AI product pattern.

## 7.2 Recommendation flow in detail

Frontend:

- home page requests recommendations when logged-in user is on default home
- profile page requests recommendations when recommendations tab is opened

Backend:

- get user booking history
- derive preference signal from categories
- get event list
- ask Gemini to choose 3 event IDs
- parse model output using regex
- validate IDs against known events
- map matching events to DTO
- fallback to random events if AI result is empty

### Why this is clever

You do not fully trust the model output.
You:

- constrain format
- parse output
- verify IDs exist
- fallback when needed

That is exactly the correct mindset for AI-assisted backend design.

## 7.3 Limits of the current AI approach

- responses depend heavily on prompt quality
- no moderation layer is visible
- no rate-limiting is visible
- recommendation quality depends on category-only history
- all events are loaded without smart ranking before prompt
- chat currently uses all events, not only relevant or upcoming ones

### What advanced version might include

- prompt templates in dedicated files
- caching
- richer user preference model
- recommendation scoring before LLM stage
- event filtering before prompting
- AI audit logs
- prompt injection defenses
- content moderation

---

## 8. Security Review and Hardening Notes

If your goal is mastery, do not only understand implemented security.
Understand where it is weak.

## 8.1 Good security choices already present

- stateless JWT auth
- BCrypt password hashing
- protected endpoints
- role authorities
- centralized authentication filter
- no plain password storage

## 8.2 Security weaknesses in current implementation

### 1. Role can be supplied during registration

This is a serious privilege escalation risk.

Safer design:

- ignore any role from registration request
- always assign `CUSTOMER`
- only allow admin creation through trusted admin-only flow or seed/migration

### 2. Event creation is too open

`POST /api/events` should not be public for a real system.

Safer design:

- restrict to admin or organizer

### 3. Review author can be spoofed

Review creation uses `userId` from request.

Safer design:

- derive user from authenticated principal

### 4. Booking access control is incomplete

Booking by ID does not enforce ownership.

Safer design:

- customer can see only own booking
- admin can see all
- organizer can see bookings for owned events

### 5. CORS is too open

Open allowed origin patterns with credentials are risky.

Safer design:

- explicit frontend domain allowlist
- environment-specific CORS policy

### 6. OTP design can be stronger

Current OTP is stored plainly and can be improved with:

- hashing OTP before storing
- rate limiting generation
- limiting retry attempts
- invalidating old OTP on regeneration

### 7. Payment confirmation is not webhook-driven

Never treat redirect success alone as payment truth.
Payment truth must come from Stripe webhook verification.

## 8.3 What production-grade Spring security mastery looks like

You should be able to reason about:

- authentication vs authorization
- route-level vs method-level security
- role checks vs ownership checks
- token lifecycle
- secret management
- brute force protection
- audit logging
- CORS
- CSRF relevance for session vs JWT apps
- input validation
- idempotency

That is the security bar for strong backend engineering.

---

## 9. What This Project Teaches You About Real Engineering

This project is valuable because it is not only a CRUD example.
It introduces multiple real-world engineering concerns together:

- identity and auth
- authorization
- transactions
- relational data modeling
- event-seat domain design
- external API integration
- payments
- UI/backend integration
- recommendation systems
- failure handling

That combination is exactly what helps you move from basic developer knowledge to practical full-stack backend thinking.

---

## 10. What You Should Improve Next If You Want to Master the Skill

These are the highest-value next steps.

## 10.1 Security and RBAC

- remove client-controlled role assignment during registration
- enforce admin/organizer restrictions on event creation
- enforce ownership checks on booking access
- derive review author from security context
- tighten CORS
- enable and verify method-level security explicitly

## 10.2 Payment reliability

- implement Stripe webhook
- mark bookings complete only after verified payment event
- add payment failure/timeout handling
- add hold expiration for pending bookings

## 10.3 Booking consistency

- add stronger DB constraint for seat uniqueness by event + show date + section + row + col
- consider pessimistic locking or reservation tokens
- support booking expiration cleanup

## 10.4 Validation

- add Bean Validation annotations to DTOs
- validate email format, password strength, rating bounds, and seat ranges
- standardize error payloads more strictly

## 10.5 AI maturity

- filter only upcoming events for AI prompts
- add prompt templates
- add caching
- add moderation/rate limiting
- include richer preference signals than categories only

## 10.6 Architecture maturity

- add service interfaces if needed for larger scale
- use `@ConfigurationProperties`
- reduce logic duplication between frontend and backend around date/time handling
- expand automated test coverage

## 10.7 Testing

To truly master Spring Boot, you need tests in these categories:

- unit tests for services
- repository tests with real DB slices
- controller tests with MockMvc
- security tests for role access
- integration tests for booking flows
- payment webhook tests

Without testing, code understanding stays partial.

---

## 11. A Practical Mastery Roadmap for You

If you want to master Spring Boot using this project, study in this order:

### Phase 1: Foundation

- understand controller, service, repository, entity flow
- understand dependency injection
- understand DTO mapping
- understand request lifecycle

### Phase 2: Persistence

- study every entity relationship
- learn JPA fetch behavior
- study repository derived queries
- study Flyway migrations

### Phase 3: Security

- trace JWT generation and validation end to end
- trace request flow through the filter chain
- understand RBAC and ownership checks
- fix the security gaps in this project yourself

### Phase 4: Business Logic

- study booking creation transaction
- study seat validation logic
- study layout-to-section conversion
- study error handling strategy

### Phase 5: Integrations

- study Stripe session creation
- implement Stripe webhook confirmation
- study Gemini request/response flow
- improve prompts and recommendation logic

### Phase 6: Production Readiness

- add tests
- improve validation
- improve logging
- improve concurrency handling
- improve deployment configuration

If you complete those phases in this project, you will move beyond “I know Spring Boot syntax” into “I can design and defend backend architecture.”

---

## 12. Final Summary

This project already demonstrates strong intermediate-level engineering ability.

You implemented:

- authentication
- JWT security
- RBAC foundations
- event management
- seat-based booking
- Stripe integration
- reviews
- notifications
- email flows
- reusable seating layouts
- AI chat
- AI recommendations

From a Spring Boot learning perspective, this project covers:

- REST APIs
- dependency injection
- service-layer architecture
- JPA entity modeling
- repository patterns
- transactions
- exception handling
- security filters
- JWT auth
- RBAC
- external API integrations
- configuration management

From a mastery perspective, your next growth area is not basic coding.
It is:

- security correctness
- transactional consistency
- production-grade payment handling
- stronger validation
- test coverage
- advanced architecture discipline

That is the gap between a working full-stack project and a professionally hardened system.

---

## 13. Quick Revision Notes

### What is Spring Boot

Spring Boot is a framework that helps build Java applications quickly with auto-configuration, embedded server support, and strong ecosystem integration.

### What is Spring Security

Spring Security handles authentication and authorization. In this project it uses JWT, custom filter logic, and role checks.

### What is JPA

JPA maps Java objects to relational tables and lets repositories query them with less boilerplate.

### What is RBAC

RBAC means role-based access control. Access decisions depend on a user role like `CUSTOMER` or `ADMIN`.

### What is JWT

JWT is a signed token that carries identity information and is validated on every request in stateless auth systems.

### What is a transaction

A transaction ensures multiple DB operations behave as a single unit and roll back together on failure.

### What is AI grounding

AI grounding means adding real application data to the model prompt so the output is relevant to your business context.

### What is the most important backend lesson from this project

A backend is not just endpoints and database access.
It is:

- domain modeling
- security
- consistency
- authorization
- integration reliability
- clean architecture

That is the level you should aim to master.
