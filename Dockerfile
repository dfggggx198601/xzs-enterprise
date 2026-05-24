# Stage 1: Build frontend (admin + student)
FROM node:16-alpine AS frontend-build

WORKDIR /build

# Build admin
COPY source/vue/xzs-admin/package*.json ./xzs-admin/
RUN cd xzs-admin && npm install --legacy-peer-deps
COPY source/vue/xzs-admin/ ./xzs-admin/
RUN cd xzs-admin && npm run build

# Build student
COPY source/vue/xzs-student/package*.json ./xzs-student/
RUN cd xzs-student && npm install --legacy-peer-deps
COPY source/vue/xzs-student/ ./xzs-student/
RUN cd xzs-student && npm run build

# Stage 2: Build backend JAR
FROM maven:3.6-jdk-8 AS backend-build

WORKDIR /build

# Copy pom first for dependency caching
COPY source/xzs/pom.xml ./
RUN mvn dependency:go-offline -B

# Copy frontend build output into static resources
COPY source/xzs/src ./src
COPY --from=frontend-build /build/xzs-admin/admin ./src/main/resources/static/admin
COPY --from=frontend-build /build/xzs-student/student ./src/main/resources/static/student

RUN mvn package -DskipTests -q

# Stage 3: Runtime
FROM openjdk:8-jre-slim

WORKDIR /app

COPY --from=backend-build /build/target/xzs-3.9.0.jar ./xzs.jar

# APK storage directory
RUN mkdir -p /opt/xzs

# Log directory
RUN mkdir -p /usr/log/xzs

EXPOSE 8000

ENTRYPOINT ["java", "-jar", "xzs.jar"]
CMD ["--spring.profiles.active=docker"]
