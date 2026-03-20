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

## Phase 4.5: Razorpay Payment Integration 🔜

> [!IMPORTANT]
> **Prerequisite**: Register at [razorpay.com](https://razorpay.com), enable **Razorpay Route** (Products → Route), and obtain your `key_id` (`rzp_test_...`) and `key_secret`.
>
> **Why Razorpay?** Stripe is invite-only in India. Razorpay is the equivalent used by Swiggy, Cred, and Zepto — supports UPI, PhonePe, GPay, cards, and wallets.

### Architecture: Razorpay Route Platform Flow
```
Buyer pays full amount via UPI / Card / Wallet
              ↓
    Razorpay Order Created by Backend
              ↓
    Razorpay Route splits automatically:
    - Seller linked account receives 95%
    - Platform Razorpay account holds 5% commission
              ↓
    Webhook fires → Backend confirms → Kafka OrderEvent published
```

### 💰 Razorpay Pricing & Limits

| Aspect | Details |
|---|---|
| **Account & Test Mode** | Free — no monthly fee, unlimited test transactions |
| **Domestic (UPI / Wallet / Card)** | 2% per live transaction |
| **International Cards** | 3% per live transaction |
| **UPI Transaction Limit** | ₹1,00,000 per transaction (NPCI rule) |
| **Card Transaction Limit** | ₹10,00,000 per transaction |
| **Settlement to your bank** | T+3 business days (standard) |
| **KYC to go live** | PAN + Aadhaar + Bank account required |
| **Razorpay Route activation** | Request via dashboard chat (free, usually same day) |

**Real Money Example — ₹5,000 pet sale:**
- Razorpay fee: ₹100 (2%)
- Platform commission (5%): **₹250 → your account**
- Seller payout (95% - Razorpay fee): **₹4,650 → seller's bank**

**Test Credentials (use in test mode — no real money):**
- Test Card: `4111 1111 1111 1111` · CVV: `123` · Expiry: any future date
- Test UPI: `success@razorpay` (instant success) · `failure@razorpay` (simulates failure)

### Backend Changes
#### [MODIFY] [pom.xml](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/pom.xml)
- Add `com.razorpay:razorpay-java:1.4.x` dependency.

#### [NEW] [RazorpayService.java](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/service/RazorpayService.java)
- [createOrder(pet, buyer)](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/service/RazorpayService.java#29-61) — creates a Razorpay Order with the full pet price. Uses Route to set `transfers` with 95% to seller's linked account ID.
- [verifyPaymentSignature(orderId, paymentId, signature)](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/service/RazorpayService.java#62-89) — validates the HMAC-SHA256 webhook signature to prevent fraud.
- `createSellerLinkedAccount(user)` — registers the seller's bank account as a Route linked account.

#### [NEW] `RazorpayWebhookController.java`
- `POST /api/payments/webhook` — receives Razorpay's `payment.captured` event, verifies signature, confirms the transaction, marks pet SOLD, and fires the Kafka [OrderEvent](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/payload/event/OrderEvent.java#5-54).

#### [MODIFY] [application.properties](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/resources/application.properties)
- Add `razorpay.key.id` and `razorpay.key.secret`.

#### [MODIFY] [WebSecurityConfig.java](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/security/WebSecurityConfig.java)
- Add `/api/payments/webhook` to permit-all.

### Frontend Changes
#### [NEW] Add Razorpay Checkout script
- Load `https://checkout.razorpay.com/v1/checkout.js` via `<script>` tag in [index.html](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/frontend/index.html).

#### [MODIFY] [PetDetails.jsx](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/frontend/src/components/PetDetails.jsx)
- Replace the simulation modal with a call to backend to create a Razorpay Order, then open `new window.Razorpay(options).open()` — which launches Razorpay's hosted checkout supporting UPI, cards, netbanking, wallets.
- On [handler](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/frontend/src/components/PetDetails.jsx#60-80) callback (payment success), call backend to verify signature and confirm transaction.

#### [NEW] `SellerOnboarding.jsx`
- A page for sellers to submit their bank account details for Route linked account creation.

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
2. Buyer opens the listing, clicks **Buy Now**, enters Razorpay test card `4111 1111 1111 1111`.
3. Razorpay confirms payment → Webhook/Verify fires → Kafka [OrderEvent](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/payload/event/OrderEvent.java#5-54) published.
4. Backend records transaction, marks pet SOLD.
5. Seller's connected Razorpay account receives 95% payout automatically via **Razorpay Route**.
6. Platform Razorpay account receives 5% commission.
7. Kafka consumer logs simulated email notifications for both parties.
