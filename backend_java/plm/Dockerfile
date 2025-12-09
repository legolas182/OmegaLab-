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

# Verificar que el JAR se copió correctamente
RUN ls -la /app/app.jar || (echo "Error: app.jar no encontrado" && ls -la /app/)

# Exponer el puerto (Railway lo asignará automáticamente a través de la variable PORT)
# No exponer un puerto fijo, Railway lo maneja automáticamente
EXPOSE 8080

# Comando para ejecutar la aplicación
# Railway asignará el puerto a través de la variable de entorno PORT
# La aplicación debe usar server.port=${PORT:8080} en application-prod.properties
CMD ["java", "-jar", "app.jar"]

