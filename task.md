# Pet Marketplace Platform Tasks

- [/] **Phase 1: Infrastructure & Project Setup**
  - [/] Set up `docker-compose.yml` for PostgreSQL and Apache Kafka.
  - [/] Initialize Spring Boot backend project and configure properties.
  - [/] Initialize React frontend project using Vite and configure Tailwind CSS.

- [ ] **Phase 2: Security & User Management**
  - [ ] Create `User` entity, Role enums, and Repositories.
  - [ ] Implement JWT Provider, Authentication Filter, and Spring Security Config.
  - [ ] Create Auth Controller (`/register`, `/login`) and User Details Service.
  - [ ] Build Frontend Auth UI (Login and Registration forms with API integration).

- [ ] **Phase 3: Pet Listing Core Module**
  - [ ] Create `Pet` entity and Repository.
  - [ ] Develop Pet Service and Controller (CRUD operations, Search/Filter).
  - [ ] Build Frontend Pet Dashboard (Listings grid, Search bar, Filters).
  - [ ] Build Frontend Pet Details Page.

- [ ] **Phase 4: Transactions & Kafka Integration**
  - [ ] Create `Transaction` entity and Repository for commission-based logic.
  - [ ] Configure Kafka Producer for `order-events` topic.
  - [ ] Configure Kafka Consumer for sending notifications.
  - [ ] Develop Checkout API and Transaction endpoints.
  - [ ] Build Frontend Checkout/Payment UI.

- [ ] **Phase 5: Appointments & Reviews**
  - [ ] Create `Appointment` and `Review` entities/repositories.
  - [ ] Develop REST APIs for booking vet appointments and submitting reviews.
  - [ ] Build Frontend Appointment and Review components.

- [ ] **Phase 6: Deployment Preparations**
  - [ ] Write `Dockerfile` for Spring Boot Backend.
  - [ ] Write `Dockerfile` for React Frontend.
  - [ ] Prepare deployment documentation.
