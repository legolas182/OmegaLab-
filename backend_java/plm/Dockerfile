# Usar imagen base de Maven con Java 21
FROM maven:3.9-eclipse-temurin-21 AS build

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de Maven
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
COPY mvnw.cmd .

# Descargar dependencias (esto se cachea si pom.xml no cambia)
RUN mvn dependency:go-offline -B || true

# Copiar el código fuente
COPY src ./src

# Construir la aplicación (sin ejecutar tests)
RUN mvn clean package -DskipTests

# Verificar que el JAR se creó
RUN ls -la /app/target/*.jar || (echo "JAR no encontrado, listando target:" && ls -la /app/target/)

# Imagen de runtime
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copiar el JAR desde la etapa de build (usar wildcard para encontrar el JAR)
COPY --from=build /app/target/*.jar app.jar

# Exponer el puerto (Railway lo asignará automáticamente)
EXPOSE 3001

# Comando para ejecutar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]

