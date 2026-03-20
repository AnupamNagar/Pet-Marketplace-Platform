# Platform Implementation Walkthrough (Phases 1 & 2)

This document provides a detailed explanation of the code and infrastructure implemented so far for your Pet Marketplace Platform. Currently, we have completed the core setup (Phase 1) and Security/User Management (Phase 2).

---

## 🏗️ Phase 1: Infrastructure & Project Setup

### Command to start the application in local
- Start Infrastructure: docker-compose up -d
- Start Backend: cd backend ->  mvn spring-boot:run
- Start Frontend: cd frontend -> npm run dev

### 1. Docker Compose ([docker-compose.yml](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/docker-compose.yml))
At the root level, we created a Docker Compose file to manage our local backing services:
- **PostgreSQL (`postgres`)**: A relational database to store user accounts, pet listings, and future transaction/appointment data.
- **Apache Kafka (`kafka`) & Zookeeper (`zookeeper`)**: An event streaming platform. Zookeeper manages the Kafka cluster, while Kafka itself will act as a message broker later for our notification/transaction events.

### 2. Spring Boot Backend Setup
We initialized the Java Spring Boot project using Maven ([pom.xml](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/pom.xml)):
- **Dependencies**: Included Spring Web (REST APIs), Spring Data JPA (Database mapping), Spring Security (Authentication), Spring Kafka (Messaging), and PostgreSQL driver.
- **[application.properties](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/resources/application.properties)**: Located in `src/main/resources`. This connects our Spring Boot app to the PostgreSQL database (using JDBC) and tells it where Kafka is running (localhost:9092).
- **[Main.java](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/Main.java)**: The entry point for the Spring Boot application (`@SpringBootApplication`).

### 3. React Frontend Setup
We initialized a React application mapped into a `frontend` module using Vite, which is much faster than standard Create-React-App.
- **Tailwind CSS**: We configured [tailwind.config.js](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/frontend/tailwind.config.js) and [postcss.config.js](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/frontend/postcss.config.js) to allow us to rapidly write beautiful styles using utility classes (injected into [src/index.css](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/frontend/src/index.css)).

---

## 🔒 Phase 2: Security & User Management

To secure our platform, we implemented Role-Based Access Control (RBAC) and JSON Web Tokens (JWT). When a user logs in, they receive an encrypted token instead of maintaining a "session", making our application scalable and stateless.

### 1. Database Entities and Models
- **[User.java](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/model/User.java)**: Maps to the `users` table in Postgres. Contains the username, email, encrypted password, and their specific role.
- **[Role.java](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/model/Role.java)**: An Enum containing the platform roles (`ROLE_BUYER`, `ROLE_SELLER`, `ROLE_VET`, `ROLE_ADMIN`).
- **[UserRepository.java](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/repository/UserRepository.java)**: An interface extending `JpaRepository`. Without writing any SQL, this interface automatically handles database operations like finding users by Email/Username or saving new accounts.

### 2. Core Spring Security Configuration
- **[WebSecurityConfig.java](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/security/WebSecurityConfig.java)**: This is the heart of our security. We opened access to authentication APIs (`/api/auth/**` are open endpoints) but restricted everything else (`anyRequest().authenticated()`). We also defined our Password Encoder (BCrypt) here.
- **[UserDetailsImpl](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/security/services/UserDetailsImpl.java#13-96) & [UserDetailsServiceImpl](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/security/services/UserDetailsServiceImpl.java#12-26)**: When a user logs in, Spring Security looks up the username. These specific classes load the user from the [UserRepository](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/repository/UserRepository.java#9-16) and convert them into a Spring Security "Principal" object containing their roles/authority.

### 3. JWT Filtering & Utilities (`security/jwt/`)
- **[JwtUtils.java](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/security/jwt/JwtUtils.java)**: Handles creating a new JWT token using a secret key, and parsing incoming tokens to extract the username and expiration date.
- **[AuthTokenFilter.java](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/security/jwt/AuthTokenFilter.java)**: An interceptor. For *every single request* a user makes (except `/api/auth/`), this filter intercepts the request, looks for an `Authorization: Bearer <token>` header, validates the JWT, and logs the user in if the token is valid.
- **[AuthEntryPointJwt.java](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/security/jwt/AuthEntryPointJwt.java)**: If an unauthenticated user tries to hit a secure API (like buying a pet), this class intercepts the standard server error and properly returns a JSON `401 Unauthorized` response with a readable error message.

### 4. REST APIs (`controller/` and `payload/`)
Finally, we developed the actual endpoints that our React application will talk to. 

**Data Transfer Objects (DTOs)** in `payload/`:
- **Requests**: [LoginRequest](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/payload/request/LoginRequest.java#6-14) (username & password) and [SignupRequest](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/payload/request/SignupRequest.java#8-25) (username, email, password, role). These prevent us from directly exposing our Database entities to the internet.
- **Responses**: [JwtResponse](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/payload/response/JwtResponse.java#7-24) (returns the token and profile info on login) and [MessageResponse](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/payload/response/MessageResponse.java#6-11) (generic success/fail message).

**[AuthController.java](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/controller/AuthController.java)**:
- **`POST /api/auth/signup`**: Checks if the user/email already exists. If not, sets their role, hashes their password securely using BCrypt, and saves them to PostgreSQL.
- **`POST /api/auth/signin`**: Verifies the username + password via the `AuthenticationManager`. If valid, it generates a JWT string via [JwtUtils](file:///c:/Users/KSPL152/Desktop/Pet-Marketplace-Platform/Pet-Marketplace-Platform/backend/src/main/java/com/petmarketplace/backend/security/jwt/JwtUtils.java#16-64) and sends it back alongside the user's role.

### 5. Frontend Authentication UI (`frontend/src/`)
In the React application, we built the user-facing pages and integrated them with our backend API:
- **`services/auth.service.js`**: Uses `axios` to send POST requests containing the user's credentials to our Spring Boot backend. Upon successful login, it stores the returned JWT token and user details in `localStorage`.
- **`services/auth-header.js`**: A helper function that attaches the `Authorization: Bearer <token>` header to future API requests so the backend knows the user is authenticated.
- **`components/Register.jsx` & `Login.jsx`**: Beautifully styled forms using Tailwind CSS and Lucide React icons. These components capture user input, handle form validation warnings, and call the `AuthService`.
- **`App.jsx`**: We set up React Router to navigate between the Home, Login, Register, and Profile pages. The NavBar dynamically updates to show the user's profile and a Logout button if a valid JWT token is detected in local storage.

---

## 🧪 Testing the Application Flow (End-to-End)
With Phase 1 & 2 complete, the entire architecture (Frontend UI, Backend API, Database, and Message Brokers) is functional. Here is how to verify the system:

### 1. Start the Environment
- Run `docker-compose up -d` to spin up PostgreSQL, Zookeeper, and Kafka.
- Run `mvn spring-boot:run` in the `backend/` directory.
- Run `npm run dev` in the `frontend/` directory and navigate to `http://localhost:5173`.

### 2. User Registration (Sign up)
1. Click **Sign Up** in the Navigation Bar.
2. Enter a Username, Email, Password, and select a Role (e.g., Buyer or Seller).
3. Submitting the form will send a POST request to `/api/auth/signup`.
4. The Spring Boot backend will hash the password and persist the user in the PostgreSQL database.
5. A green success message will confirm registration.

### 3. User Login & JWT Authentication
1. Click **Login** and enter the credentials just created.
2. Submitting the form sends a POST request to `/api/auth/signin`.
3. The backend authenticates the credentials against the database and generates a cryptographically signed **JSON Web Token (JWT)**.
4. The React app receives this token and stores it in Local Storage.

### 4. Protected Routes & Profile
1. Upon successful login, React automatically redirects to the `/profile` protected route.
2. The Navigation Bar dynamically updates: "Login/Sign Up" links are replaced with your **Profile** and a **Logout** button.
3. The dashboard correctly displays the User's roles retrieved from the backend.
4. Clicking **Logout** destroys the JWT token and instantly kicks the interface back to the public login state.

---

### What's Next?
We have successfully completed **Phase 1** and **Phase 2**. The entire architecture (Database, Message Broker, Backend API, Frontend UI, Security, and Routing) is properly connected. 

---

## 🐾 Phase 3: Pet Listing Core Module

In this phase, we developed the core functionality allowing sellers to list pets with detailed profiles, robust multimedia (images/videos), and implemented the discovery UI for buyers.

### 1. Pet Entity & Database Modeling
- **`Pet.java`**: Maps to the `pets` table. Contains rich data like `name`, `breed`, `age`, `price`, and `description`.
- **Enums**: Utilized `PetCategory` (DOG, CAT, BIRD, etc.) and `PetStatus` (AVAILABLE, SOLD, PENDING) for stringent data validation.
- **Multimedia Relationships**: Utilized `@ElementCollection` to map up to 5 `imageUrls` via a separate joined table (`pet_images`) and a `videoUrl` directly onto the Pet entity.
- **Foreign Keys**: Linked every `Pet` to a `User` (the seller) using a `@ManyToOne` relationship to enforce ownership constraints.

### 2. Media File Storage Service
- **`FileStorageService.java`**: Implemented a local file system storage handler that takes incoming `MultipartFile`s, cleans the filename, validates against path traversal exploits, and generates an absolutely unique UUID filename to prevent overwrites.
- **`FileController.java`**: Provides a secured `POST /api/files/upload` endpoint matching seller credentials, and a universally open `GET /api/files/{fileName}` for serving images/videos directly from the `uploads/` directory back to the client.

### 3. Pet Management REST APIs
- **`PetController.java` & `PetService.java`**: Provides secured endpoints for `POST`, `PATCH`, and `DELETE` required to create/edit listings. Ensures only the *owning* seller of a Pet can mutate its status.
- **Public Discovery**: Provides completely public `GET` APIs returning active inventory and offering complex query parameters for finding pets by `category` and `keyword`. 
- **Data Transfer Objects**: Built `PetRequest` and `PetResponse` objects to encapsulate list mapping arrays (`imageUrls`), preventing recursive JSON serialization errors between joined entities.

### 4. Frontend Interactive UI (React)
- **`PetDashboard.jsx`**: A grid layout displaying preview cards of available pets. Includes interactive category filters and a keyword search bar hooked directly into the backend discovery API.
- **`CreatePetListing.jsx`**: A complex form enabling sellers to list pets. Implements asynchronous sequential multi-part uploads to securely push up to 5 image files and 1 video file to the server and stitch their locations back into the final `Pet` creation request.
- **`PetDetails.jsx`**: A massive interactive multimedia gallery component. Replaced standard images with a state-driven main viewport capable of swapping out high-resolution photos or securely executing a raw HTML5 `<video>` feed based on user thumbnail interaction.

---

## ⚠️ Phase 3 Complexities & Bug Resolutions

1. **Unsplash API Deprecation & CORS loops**: Initially used an external randomized API for missing placeholders. When that API blocked localhost traffic, images triggered infinite 404 loops in React. *Fix: Implemented `referrerPolicy="no-referrer"`, handled React `onError` events cleanly, and migrated to a stable `Placehold.co` fallback.*
2. **Spring Boot Multi-part Limitations**: Spring defaults strictly cap uploads at 1MB, throwing fatal 413 "Payload Too Large" errors when attempting to attach High-Definition videos. *Fix: Explicitly increased internal `spring.servlet.multipart.max-file-size` to 50MB and `max-request-size` to 100MB in properties.*
3. **CORS Preflight (OPTIONS) Blocked by JWT**: When doing complex multi-part Form Data passing, modern browsers execute a preflight `OPTIONS` check. Spring Security aggressively blocked these, seeing them as unauthenticated token-less attempts. *Fix: Injected a global `CorsConfigurationSource` to override Spring Security and permit raw `OPTIONS` calls securely.*

---

## 🧪 Phase 3 Verification & Testing Plan

### 1. API Seed Testing
Built `seed-data.ps1` (PowerShell Script):
- Automatically registered a `ROLE_SELLER` test user dynamically.
- Extracted and stored a valid `Bearer JWT Token` locally in powershell runtime variables.
- Crafted structured JSON matching the `PetRequest` DTO and forcefully injected beautiful mock Pet categories (Dogs, Cats, Rabbits) to bypass standard UI workflows and stress-test Database foreign key assignment.

### 2. End-to-End Multimedia Verification
- Uploaded valid `.jpg` and `.mp4` file drops via the Create UI component. Validated Spring Boot correctly caught the byte-streams and wrote physical representations to the local NTFS system (`/backend/uploads/`).
- Validated that the HTTP 200 response URLs correctly pointed towards `http://localhost:8080/api/files/UUID` and properly resolved as valid byte array streams on the React UI.

---

---

### What's Next?
Next up is **Phase 4: Transactions & Kafka Integration**.

---

## 💳 Phase 4: Transactions & Kafka Integration

In this phase we implemented a decoupled, event-driven purchase system. When a buyer buys a pet, three things happen simultaneously: a Transaction is recorded, the Pet status is marked SOLD, and an asynchronous Kafka event fires to simulate notification services.

### 1. Transaction Entity & Commission Logic
- **`Transaction.java`**: Maps to the `transactions` table. Each record stores the `buyer`, `seller`, `pet`, the full `amount`, the calculated `commissionFee` (5%), and `payoutAmount` (95%). Uses `@ManyToOne` FK relationships.
- **`TransactionStatus.java`**: Enum with states `PENDING`, `COMPLETED`, `FAILED`, `REFUNDED` — ready for future Stripe webhook integration.
- **`TransactionRepository.java`**: Query methods for buyer and seller history (`findByBuyerIdOrderByCreatedAtDesc`, `findBySellerIdOrderByCreatedAtDesc`).

### 2. Kafka Event Architecture
- **`OrderEvent.java`**: A lightweight POJO (Event DTO) carrying `transactionId`, `petId`, `petName`, `buyerEmail`, `sellerEmail`, and `amount` across the message bus.
- **`OrderEventProducer.java`**: A `@Service` injected with `KafkaTemplate<String, OrderEvent>`. On checkout, it calls `kafkaTemplate.send("order-events", event)` to publish the event asynchronously.
- **`OrderEventConsumer.java`**: A `@KafkaListener` listening to the `order-events` topic. When triggered, it logs simulated email notifications to both the Buyer and the Seller. Designed as a plug-in point for real email/SMS APIs (e.g., SendGrid, Twilio).
- **`application.properties`**: Configured `JsonSerializer` for producer and `JsonDeserializer` (with trusted packages) for the consumer to handle the `OrderEvent` POJO correctly.

### 3. Checkout REST API
- **`TransactionService.java`**: Core business logic — validates pet availability, prevents self-purchase, calculates the 5% commission split, saves the `Transaction`, mutates the `PetStatus` to `SOLD`, and fires the Kafka event.
- **`TransactionController.java`**: Exposes `POST /api/transactions/checkout` (for all logged-in users), `GET /api/transactions/buyer`, and `GET /api/transactions/seller`. All endpoints secured with JWT + role guards.

### 4. Frontend Checkout UI
- **`transaction.service.js`**: Axios service for calling checkout and history endpoints with the stored JWT token.
- **`PetDetails.jsx` — Buy Now Modal**: Replaced the placeholder "Contact Seller" button with a functional **"Buy Now"** button. Clicking it opens a polished confirmation modal showing the pet thumbnail, price, 5% platform fee breakdown, and a "Confirm Purchase" button. On success, the button is replaced by a green ✅ "Purchase Successful!" banner showing the Transaction ID.

---

## ⚠️ Phase 4 Complexities & Bug Resolutions

1. **Kafka Consumer JSON Deserialization Error**: The consumer initially failed to deserialize the `OrderEvent` POJO because the `JsonDeserializer` didn't know which class to map to. *Fix: Added `spring.kafka.consumer.properties.spring.json.value.default.type` and `trusted.packages=*` to `application.properties`.*
2. **JSX Modal Outside Return Block**: The checkout modal was accidentally placed outside the root return `<div>`, breaking the component. *Fix: Moved the closing root `</div>` to after the modal block, correctly nesting the overlay inside the component tree.*
3. **Self-Purchase Prevention**: Without a guard, a seller could buy their own listing. *Fix: Added a condition in `TransactionService` (`if pet.getSeller().getId().equals(buyer.getId())`) and mirrored it in the UI by disabling the Buy Now button if `currentUser.username === pet.sellerUsername`.*

---

## 🧪 Phase 4 Verification & Testing Plan

### 1. Manual API Testing via Postman
```
# Step 1: Login as buyer to get JWT
POST http://localhost:8080/api/auth/signin
Body: { "username": "buyer_user", "password": "password" }

# Step 2: Execute Checkout
POST http://localhost:8080/api/auth/checkout
Authorization: Bearer <token>
Body: { "petId": 2 }

# Step 3: Verify buyer's order history
GET http://localhost:8080/api/transactions/buyer
Authorization: Bearer <token>
```

### 2. Kafka Event Verification
- After checkout, watch the Spring Boot console for the Kafka pipeline logs:
  ```
  #### -> Producing message -> OrderEvent{transactionId=1, petId=2, petName='Max', ...}
  #### -> Consumed message -> OrderEvent{...}
  🔔 SIMULATING NOTIFICATION SERVICES:
  📧 Email to Buyer - Successfully purchased Max
  📧 Email to Seller - Your pet Max was sold for $500.0
  ```

### 3. End-to-End UI Test
1. Log in as **Buyer**. Open a pet listing → click **Buy Now**.
2. Confirm the price breakdown modal.
3. Confirm Purchase → green success banner appears with Transaction ID.
4. Refresh `/pets` dashboard → the purchased pet is removed from available listings.

---

---

## 🇮🇳 Phase 4.5: Razorpay Payment Integration

In this phase, we pivoted from Stripe (invite-only in India) to **Razorpay**, the industry standard for Indian marketplaces. We implemented the **Razorpay Route** architecture to handle automatic 5% commission splits.

### 1. Backend Service Layer
- **`RazorpayService.java`**: Handles the connection to Razorpay API. It converts the pet price to paise (INR x 100), creates a Razorpay Order, and generates the `key_id` plus `order_id` for the frontend.
- **Signature Verification**: Implemented a secure HMAC-SHA256 verification method that checks `order_id + "|" + payment_id` against the secret key to prevent spoofing.

### 2. Razorpay REST Controller
- **`POST /api/payments/create-order`**: Secured endpoint that verifies the pet exists and returns the order details needed for the frontend popup.
- **`POST /api/payments/verify`**: The main confirmation endpoint. It verifies the signature, and if valid, triggers the existing `TransactionService` to fulfill the order, mark it SOLD, and fire the Kafka event.
- **`POST /api/payments/webhook`**: Public backup endpoint for asynchronous confirmation from Razorpay's servers.

### 3. Frontend Checkout Integration
- **`index.html`**: Globally loaded the `checkout.js` script from Razorpay's CDN.
- **`PetDetails.jsx`**: Replaced the mock checkout with the real **Razorpay Checkout** popup. It pre-fills the buyer's name/email and handles success/failure callbacks dynamically.

---

## ⚠️ Phase 4.5 Complexities & Bug Resolutions

1. **BigDecimal Type Mismatch**: The pet price was stored as `BigDecimal`, but Razorpay requires `Long` (paise). *Fix: Used `.multiply(new BigDecimal(100)).longValue()` to safely convert without precision loss.*
2. **Ambiguous JSONObject Methods**: The `org.json` library had multiple `put()` signatures causing compilation errors. *Fix: Explicitly cast values or used `String.valueOf()` to resolve ambiguity.*

---

## 🧪 Phase 4.5 Verification & Testing Plan

### Step-by-Step Test:
1. **Run Backend & Frontend** (see the run commands provided earlier).
2. **Login as Buyer** and find any **AVAILABLE** pet list.
3. Click **"Buy Now"** → Click **"Confirm Purchase"**.
4. The **Razorpay Checkout** popup will appear.
5. **Test Card**: Use `4111 1111 1111 1111` for card testing.
6. **Test UPI**: Click UPI and enter `success@razorpay` for an instant success simulation.
7. Upon success, the popup closes, the page updates to **"Purchase Successful!"**, and you can find your order in the backend database.

---

### What's Next?
**Phase 5: Appointments & Reviews** — Building the vet booking system and user feedback loop.
