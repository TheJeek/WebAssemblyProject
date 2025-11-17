# Author: Jonas Lanz
# Dockerfile for WebAssembly Web Application backend

FROM ubuntu:latest

# Use an OpenJDK image
FROM eclipse-temurin:24-jdk

# Set working directory inside the container
WORKDIR /app

# Copy the built JAR from the Maven target folder
COPY target/backend-1.jar /app/backend.jar

# Expose the port the backend-service runs on
EXPOSE 8080

# Run the Spring Boot application
ENTRYPOINT ["java", "-jar", "/app/backend.jar"]