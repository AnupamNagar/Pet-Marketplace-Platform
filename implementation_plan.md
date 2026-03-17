# Pet Marketplace Platform Implementation Plan

## Goal
Build a full-stack, production-grade Pet Marketplace Platform. Sellers list pets, buyers purchase them securely, and the platform earns a 5% commission. Real money flows via **Stripe Connect**. Events are processed asynchronously via **Apache Kafka**.

**Tech Stack**: Java 17, Spring Boot 3, React.js + Vite, PostgreSQL, Apache Kafka, Stripe Connect, JWT Security.

---

## Phase 1: Infrastructure & Project Setup ✅
- [docker-compose.yml](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/docker-compose.yml) to spin up PostgreSQL (port 5433) and Apache Kafka (port 9092) locally.
- Spring Boot project initialized with all dependencies (Web, JPA, Security, Kafka, Stripe).
- React.js + Vite frontend with Tailwind CSS configured.

## Phase 2: Security & User Management ✅
- [User](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/model/User.java#12-40) entity and `Role` enum (`BUYER`, `SELLER`, `VET`, `ADMIN`) mapped to PostgreSQL.
- JWT-based stateless authentication ([JwtUtils](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/security/jwt/JwtUtils.java#16-64), [AuthTokenFilter](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/security/jwt/AuthTokenFilter.java#20-64), [AuthEntryPointJwt](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/security/jwt/AuthEntryPointJwt.java#18-41)).
- REST APIs: `POST /api/auth/signup`, `POST /api/auth/signin`.
- Frontend: Login and Register pages with full API integration.

## Phase 3: Pet Listing Core Module ✅
- [Pet](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/model/Pet.java#17-82) entity with `@ElementCollection` for up to 5 `imageUrls` + single `videoUrl`.
- [FileStorageService](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/service/FileStorageService.java#15-65) and [FileController](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/controller/FileController.java#21-71) for secure multipart file uploads (50MB limit).
- REST APIs: CRUD pet listings + search/filter by category and keyword.
- Frontend: Pet Dashboard (grid/search), Pet Details (interactive media gallery), Create Listing (drag-and-drop media uploader).

## Phase 4: Transactions & Kafka Integration ✅
- [Transaction](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/model/Transaction.java#7-123) entity storing amount, 5% `commissionFee`, `payoutAmount`, Buyer, Seller, Pet relationships.
- [OrderEventProducer](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/kafka/OrderEventProducer.java#10-23) publishes [OrderEvent](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/payload/event/OrderEvent.java#5-54) to the `order-events` Kafka topic on every purchase.
- [OrderEventConsumer](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/kafka/OrderEventConsumer.java#9-26) listens and simulates email notifications for Buyer and Seller.
- REST APIs: `POST /api/transactions/checkout`, `GET /api/transactions/buyer`, `GET /api/transactions/seller`.
- Frontend: "Buy Now" modal with price breakdown and async checkout call.

---

## Phase 4.5: Stripe Payment Integration 🔜

> [!IMPORTANT]
> **Prerequisite**: Register at [stripe.com](https://stripe.com), enable Stripe Connect, and obtain your `sk_test_...` Secret Key and `pk_test_...` Publishable Key.

### Architecture: Stripe Connect Platform Flow
```
Buyer pays →  Stripe Payment Intent  →  Platform receives full amount
                                        ↓
                       Stripe splits automatically:
                       - Seller connected account receives 95%
                       - Platform (your) Stripe account receives 5%
```

### Backend Changes
#### [MODIFY] [pom.xml](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/pom.xml)
- Add `com.stripe:stripe-java:25.x` dependency.

#### [NEW] `StripeService.java`
- `createPaymentIntent(pet, buyer)` — creates a Stripe Payment Intent with `application_fee_amount` set to 5% and the `transfer_data.destination` pointing to the seller's Stripe account ID.
- `createSellerOnboardingLink(user)` — generates a Stripe Connect OAuth URL for sellers to register their bank account and complete KYC.

#### [NEW] `StripeWebhookController.java`
- `POST /api/payments/webhook` — receives Stripe's async `payment_intent.succeeded` event, confirms the transaction, updates pet status to SOLD, and fires the Kafka [OrderEvent](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/payload/event/OrderEvent.java#5-54).

#### [MODIFY] [TransactionService.java](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/service/TransactionService.java)
- [processCheckout()](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/service/TransactionService.java#36-80) now calls `StripeService.createPaymentIntent()` and returns a `clientSecret` to the frontend instead of confirming immediately.

#### [MODIFY] [WebSecurityConfig.java](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/security/WebSecurityConfig.java)
- Add `/api/payments/webhook` to permit-all (Stripe calls this without auth).

### Frontend Changes
#### [NEW] Install `npm install @stripe/react-stripe-js @stripe/stripe-js`

#### [MODIFY] [PetDetails.jsx](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/frontend/src/components/PetDetails.jsx)
- Replace the Buy Now modal with `<Elements>` (Stripe provider) wrapping a `<PaymentElement>` form.
- On mount, call backend to get `clientSecret`, then use `stripe.confirmPayment()`.

#### [NEW] `SellerOnboarding.jsx`
- A page for sellers to connect their Stripe bank account. Calls the onboarding API and redirects to Stripe.

---

## Phase 5: Appointments & Reviews
- `Appointment` entity: Buyer books a vet appointment with date/time, linked to a [User](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/model/User.java#12-40) (Vet).
- `Review` entity: Buyers rate and review completed purchases.
- REST APIs for CRUD operations on both entities.
- Frontend: Booking calendar component and star-rating review form.

## Phase 6: Deployment
- `Dockerfile` for Spring Boot backend (multi-stage build).
- `Dockerfile` for React frontend (Nginx serving static build).
- `docker-compose.prod.yml` for production orchestration.
- Deployment guide for AWS/Render with environment variable configuration.

---

## Verification Plan

### Automated Tests
- Unit Tests: JUnit + Mockito for [PetService](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/service/PetService.java#17-137), [TransactionService](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/service/TransactionService.java#19-108), `StripeService`.
- Integration Tests: `@SpringBootTest` with TestContainers (PostgreSQL + Kafka).

### Manual End-to-End Verification
1. Seller lists a pet with 3 images + 1 video via the Create Listing form.
2. Buyer opens the listing, clicks **Buy Now**, enters Stripe test card `4242 4242 4242 4242`.
3. Stripe confirms payment → Webhook fires → Kafka [OrderEvent](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/payload/event/OrderEvent.java#5-54) published.
4. Backend records transaction, marks pet SOLD.
5. Seller's connected Stripe account receives 95% payout automatically.
6. Platform Stripe account receives 5% commission.
7. Kafka consumer logs simulated email notifications for both parties.
