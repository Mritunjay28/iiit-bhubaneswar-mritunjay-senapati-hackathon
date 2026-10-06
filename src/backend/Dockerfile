# Multi-stage production Dockerfile for Spring Boot Risk Engine Backend
# Stage 1: Build the JAR
FROM maven:3.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# Copy Maven POM and dependency definitions first for layer caching
COPY pom.xml .
RUN mvn dependency:resolve -B

# Copy application source code
COPY src ./src

# Build production JAR without tests
RUN mvn clean package -DskipTests

# Stage 2: Lightweight JRE Runtime
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create non-root system user for security compliance
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy built JAR from builder stage
COPY --from=builder /build/target/risk-engine-backend-0.0.1-SNAPSHOT.jar app.jar

# Expose standard Spring Boot port
EXPOSE 8080

# Environment variables with sensible defaults
ENV SPRING_PROFILES_ACTIVE=production \
    JAVA_OPTS="-Xms256m -Xmx1024m -XX:+UseG1GC"

# Healthcheck for container orchestration
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Entrypoint running optimized JVM
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
