# Pet Marketplace Platform Implementation Plan

## Goal Description
Build a full-stack, scalable microservices-based (or modular monolithic to start) Pet Marketplace Platform. The platform allows users to buy, sell, and schedule vet appointments for pets, featuring secure commission-based transactions. 
Tech stack: Java, Spring Boot, React.js, PostgreSQL, and Apache Kafka.

## User Review Required
> [!IMPORTANT]
> Please review the architecture approach. Starting with a **Modular Monolith** is recommended for faster initial development, while utilizing **Apache Kafka** to decouple domains (like Transactions and Notifications). We can split the modules into separate microservices later if scaling requires it. If you strictly prefer starting with disjointed microservices (API Gateway + Eureka/Consul + separate repos/services), please let me know.

## Proposed Architecture & Tech Stack Details
- **Frontend**: React.js with Vite, styled using Tailwind CSS for a rich, modern aesthetic.
- **Backend API**: Java 17+, Spring Boot (Web, Data JPA, Security).
- **Database**: PostgreSQL for relational data storage (Users, Pets, Appointments, Transactions).
- **Event Bus**: Apache Kafka for processing asynchronous events (e.g., `OrderPlacedEvent`, `UserRegisteredEvent`).
- **Security**: Spring Security with JWT (JSON Web Tokens) and Role-Based Access Control (Roles: BUYER, SELLER, VET, ADMIN).

## Phases of Implementation

### Phase 1: Infrastructure & Project Setup
- Create a `docker-compose.yml` to spin up PostgreSQL and Apache Kafka (with Zookeeper or KRaft) locally.
- Initialize the Spring Boot project with necessary dependencies (Web, JPA, Postgres, Spring Kafka, Spring Security).
- Initialize the React.js project using Vite.

### Phase 2: Security & User Management
- Implement Database Schemas for Users and Roles.
- Develop Spring Security configurations and JWT filter/utilities.
- Build REST APIs for User Registration and Authentication.
- Develop Frontend Auth pages (Login, Register).

### Phase 3: Pet Listing Core Module
- Implement Database Schemas for Pet profiles (Breed, Age, Price, Category, Status).
- Develop CRUD REST APIs to manage pet listings, with search/filter endpoints.
- Develop Frontend Pet Discovery UI (Dashboard) and Pet Details pages.

### Phase 4: Transactions & Kafka Integration
- Implement the Order/Transaction service handles commission-based logic.
- Set up Kafka Producers to publish events when an order is placed.
- Set up Kafka Consumers to listen to transaction events and handle notifications (e.g., sending email/SMS simulation or platform alerts).
- Create Checkout and Order History UI in the Frontend.

### Phase 5: Appointments & Reviews
- Implement Vet appointment booking functionality.
- Implement Review and Rating systems for users and transactions.
- Frontend UI for booking and viewing appointments.

### Phase 6: Deployment
- Containerize both Backend and Frontend using Docker (`Dockerfile`).
- Provide scripts/guidelines for deploying to a cloud provider (e.g., AWS, Render, Jenkins CI/CD pipeline overview).

## Verification Plan

### Automated Tests
- Unit Testing with JUnit and Mockito for backend business logic.
- Integration Testing for REST endpoints.

### Manual Verification
- Verify End-to-End flow: User registers -> Lists a pet -> Another user buys pet -> Kafka triggers notification -> Financial records updated.
