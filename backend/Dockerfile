# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copy Maven wrapper and pom first for layer caching
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Download dependencies (cached as long as pom.xml doesn't change)
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy source and build JAR (skip tests — tests run in CI before this)
COPY src src
RUN ./mvnw clean package -DskipTests -B

# ─── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create a non-root user for security
RUN addgroup -S petverse && adduser -S petverse -G petverse

COPY --from=build /app/target/*.jar app.jar

# Render / Hosting platforms expect $PORT to be honored
ENV SERVER_PORT=${PORT:-8080}

RUN chown petverse:petverse app.jar
USER petverse

EXPOSE 8080

ENTRYPOINT ["java", \
  "-Dspring.profiles.active=prod", \
  "-Dserver.port=${SERVER_PORT}", \
  "-jar", "app.jar"]
