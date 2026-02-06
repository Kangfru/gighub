# Build stage
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Copy Gradle wrapper
COPY gradlew .
COPY gradle gradle

# Copy Gradle files
COPY build.gradle.kts settings.gradle.kts ./

# Download dependencies (cached layer)
RUN ./gradlew dependencies --no-daemon || true

# Copy source code
COPY src src

# Build application
RUN ./gradlew bootJar --no-daemon -x test

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy jar from build stage
COPY --from=build /app/build/libs/*.jar app.jar

# Expose port
EXPOSE 8080

# Run application
ENTRYPOINT ["java", "-Dspring.profiles.active=prod", "-jar", "app.jar"]
