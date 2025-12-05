# Use official Maven image to build the Spring Boot app
FROM maven:3.9.4-eclipse-temurin-21 AS build

# Set the working directory
WORKDIR /app/backend

# Copy pom.xml file and install dependencies
COPY backend/pom.xml .
RUN mvn dependency:go-offline

# Copy the source code and build the application
COPY backend/src ./src
RUN mvn clean package -DskipTests

# Use an official Eclipse Temurin image to run the application
FROM eclipse-temurin:21-jre

# Set the working directory
WORKDIR /app

# Copy the build JAR file from the build stage
COPY --from=build /app/backend/target/ragapp-0.0.1-SNAPSHOT.jar .

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/ragapp-0.0.1-SNAPSHOT.jar"]