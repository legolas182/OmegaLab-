#!/bin/bash
# Script para iniciar la aplicación Spring Boot
# Encuentra el JAR automáticamente

echo "Buscando archivo JAR..."

# Buscar el JAR ejecutable en target/ (excluyendo sources y javadoc)
JAR_FILE=$(find target -maxdepth 1 -name "*.jar" ! -name "*-sources.jar" ! -name "*-javadoc.jar" ! -name "original-*.jar" | head -n 1)

if [ -z "$JAR_FILE" ]; then
    echo "Error: No se encontró el archivo JAR en target/"
    echo "Listando contenido de target/:"
    ls -la target/ 2>/dev/null || echo "Directorio target/ no existe"
    echo ""
    echo "Intentando construir el JAR..."
    mvn clean package -DskipTests
    JAR_FILE=$(find target -maxdepth 1 -name "*.jar" ! -name "*-sources.jar" ! -name "*-javadoc.jar" ! -name "original-*.jar" | head -n 1)
    if [ -z "$JAR_FILE" ]; then
        echo "Error: No se pudo construir el JAR"
        exit 1
    fi
fi

echo "Iniciando aplicación con JAR: $JAR_FILE"
exec java -jar "$JAR_FILE"

