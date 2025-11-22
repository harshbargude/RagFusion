### Multi-stage Dockerfile: build with Maven, run with lightweight JRE
FROM maven:3.9.4-eclipse-temurin-21 AS build
WORKDIR /workspace

# copy maven wrapper & pom for dependency caching
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN ./mvnw -ntp -B -f pom.xml -DskipTests dependency:go-offline

# copy sources and build
COPY src ./src
RUN ./mvnw -B -DskipTests package -DskipTests

FROM eclipse-temurin:21-jre
RUN addgroup --system app && adduser --system --ingroup app app
WORKDIR /app

# copy artifact
COPY --from=build /workspace/target/*.jar app.jar
RUN chown app:app /app/app.jar
USER app

# reasonable defaults, can be overridden via env
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75 -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp"
EXPOSE 8080

ENTRYPOINT ["sh","-c","exec java $JAVA_OPTS -jar /app/app.jar --spring.profiles.active=prod"]
