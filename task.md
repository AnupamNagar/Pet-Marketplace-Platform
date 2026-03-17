# Pet Marketplace Platform Tasks

- [x] **Phase 1: Infrastructure & Project Setup**
  - [x] Set up [docker-compose.yml](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/docker-compose.yml) for PostgreSQL and Apache Kafka.
  - [x] Initialize Spring Boot backend project and configure properties.
  - [x] Initialize React frontend project using Vite and configure Tailwind CSS.

- [x] **Phase 2: Security & User Management**
  - [x] Create [User](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/model/User.java#12-40) entity, Role enums, and Repositories.
  - [x] Implement JWT Provider, Authentication Filter, and Spring Security Config.
  - [x] Create Auth Controller (`/register`, `/login`) and User Details Service.
  - [x] Build Frontend Auth UI (Login and Registration forms with API integration).

- [x] **Phase 3: Pet Listing Core Module**
  - [x] Create [Pet](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/model/Pet.java#17-82) entity and Repository.
  - [x] Develop Pet Service and Controller (CRUD operations, Search/Filter).
  - [x] Build [FileStorageService](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/service/FileStorageService.java#15-65) and [FileController](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/controller/FileController.java#21-71) for multipart uploads (max 5 images + 1 video).
  - [x] Build Frontend Pet Dashboard (Listings grid, Search bar, Filters).
  - [x] Build Frontend Pet Details Page with interactive media gallery.
  - [x] Build Frontend Create Pet Listing form with media uploads.

- [x] **Phase 4: Transactions & Kafka Integration**
  - [x] Create [Transaction](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/model/Transaction.java#7-123) entity, `TransactionStatus` enum, and Repository.
  - [x] Configure Kafka Producer ([OrderEventProducer](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/kafka/OrderEventProducer.java#10-23)) for `order-events` topic.
  - [x] Configure Kafka Consumer ([OrderEventConsumer](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/kafka/OrderEventConsumer.java#9-26)) for simulated notifications.
  - [x] Develop Checkout API ([TransactionController](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/controller/TransactionController.java#13-42) & [TransactionService](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/service/TransactionService.java#19-108)) with 5% commission logic.
  - [x] Build Frontend Buy Now modal with price breakdown and real checkout flow.

- [ ] **Phase 4.5: Stripe Payment Integration**
  - [ ] Register for Stripe account and obtain API keys.
  - [ ] Add `stripe-java` SDK to [pom.xml](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/pom.xml).
  - [ ] Build `StripeService` to create Payment Intents with seller payout split.
  - [ ] Build Seller Onboarding API using Stripe Connect (bank account/KYC).
  - [ ] Configure Stripe Webhook endpoint to confirm payments and trigger Kafka events.
  - [ ] Install `@stripe/react-stripe-js` on frontend.
  - [ ] Replace checkout modal with real Stripe Payment Element UI.
  - [ ] Test end-to-end real transaction with test card `4242 4242 4242 4242`.

- [ ] **Phase 5: Appointments & Reviews**
  - [ ] Create `Appointment` and `Review` entities/repositories.
  - [ ] Develop REST APIs for booking vet appointments and submitting reviews.
  - [ ] Build Frontend Appointment and Review components.

- [ ] **Phase 6: Deployment Preparations**
  - [ ] Write `Dockerfile` for Spring Boot Backend.
  - [ ] Write `Dockerfile` for React Frontend.
  - [ ] Prepare deployment documentation.
