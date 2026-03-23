# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy pom first for layer caching
COPY pom.xml .

# Download dependencies (cached as long as pom.xml doesn't change)
RUN mvn dependency:go-offline -B

# Copy source and build JAR (skip tests — tests run in CI before this)
COPY src src
RUN mvn clean package -DskipTests -B

# ─── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create a non-root user for security
RUN addgroup -S petverse && adduser -S petverse -G petverse

COPY --from=build /app/target/*.jar app.jar

# Render / Hosting platforms expect $PORT to be honored
ENV SERVER_PORT=${PORT:-8080}

# Create uploads directory and grant permissions to the non-root user
RUN mkdir -p uploads && chown -R petverse:petverse /app
USER petverse

EXPOSE 8080

ENTRYPOINT ["java", \
  "-Dspring.profiles.active=prod", \
  "-Dserver.port=${SERVER_PORT}", \
  "-jar", "app.jar"]
