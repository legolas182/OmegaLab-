# PT-MTC-01.Manual Técnico de Configuración (Plantilla)

## Proscience Lab - PLM/LIMS
v1.0

**HISTORIAL DE REVISIÓN**

| Versión | Fecha Elaboración | Responsable Elaboración | Fecha Aprobación | Responsable Aprobación |
| --- | --- | --- | --- | --- |
| 1.0 | 10/01/2025 | Sistema |  |  |
|  |  |  |  |  |

**CAMBIOS RESPECTO A LA VERSIÓN ANTERIOR**

| **VERSIÓN** | **MODIFICACIÓN RESPECTO VERSIÓN ANTERIOR** |
| --- | --- |
| 1.0 | Creación inicial del documento. |
|  |  |
|  |  |

## Tabla de Contenido.

1. [Introducción](#1-introducción)
2. [Alcance](#2-alcance)
3. [Definiciones, siglas y abreviaturas](#3-definiciones-siglas-y-abreviaturas)
4. [Aspectos técnicos](#4-aspectos-técnicos)
5. [Requisitos de configuración](#5-requisitos-de-configuración)
6. [Proceso de configuración o despliegue](#6-proceso-de-configuración-o-despliegue)
7. [Ingreso al sistema](#7-ingreso-al-sistema)
8. [Otras consideraciones](#8-otras-consideraciones)

## 1. Introducción

Este documento proporciona las directrices técnicas para la instalación, configuración y despliegue del sistema **Proscience Lab - PLM/LIMS** (Product Lifecycle Management / Laboratory Information Management System). El proyecto está orientado a la gestión integral del ciclo de vida de productos nutracéuticos, desde la generación de ideas hasta la producción, incluyendo la gestión de materiales, BOMs (Bill of Materials), pruebas de laboratorio y trazabilidad completa.

Este manual asegura que todos los aspectos técnicos estén bien documentados para facilitar el proceso de implementación y mantenimiento del sistema, garantizando una instalación correcta tanto en entornos de desarrollo como de producción.

## 2. Alcance

El alcance de este documento cubre la configuración técnica y el despliegue del sistema **Proscience Lab - PLM/LIMS**. Incluye:

- ✅ **Preparación del entorno de desarrollo y producción**
- ✅ **Instalación de herramientas y dependencias necesarias**
- ✅ **Configuración del backend (Spring Boot)**
- ✅ **Configuración del frontend (React + Vite)**
- ✅ **Configuración de la base de datos MySQL en Azure**
- ✅ **Configuración de seguridad y autenticación JWT**
- ✅ **Integración con servicios externos (OpenAI API)**
- ✅ **Proceso de despliegue en plataformas cloud**:
  - Frontend en **Vercel**
  - Backend en **Railway**
  - Base de datos en **Azure Database for MySQL**

Este manual es aplicable a todas las fases de implementación del sistema, incluyendo desarrollo, pruebas y producción.

## 3. Definiciones, siglas y abreviaturas

- **SGBD**: Sistema de Gestión de Bases de Datos.
- **IDE**: Entorno de Desarrollo Integrado.
- **SDK**: Kit de Desarrollo de Software.
- **JDK**: Kit de Desarrollo de Java.
- **JRE**: Entorno de Ejecución de Java.
- **API**: Interfaz de Programación de Aplicaciones.
- **REST**: Representational State Transfer (Transferencia de Estado Representacional).
- **HTTPS**: Protocolo Seguro de Transferencia de Hipertexto.
- **JWT**: JSON Web Token (Token Web JSON).
- **ORM**: Object-Relational Mapping (Mapeo Objeto-Relacional).
- **JPA**: Java Persistence API (API de Persistencia de Java).
- **PWA**: Progressive Web App (Aplicación Web Progresiva).
- **CORS**: Cross-Origin Resource Sharing (Intercambio de Recursos de Origen Cruzado).
- **PLM**: Product Lifecycle Management (Gestión del Ciclo de Vida del Producto).
- **LIMS**: Laboratory Information Management System (Sistema de Gestión de Información de Laboratorio).
- **BOM**: Bill of Materials (Lista de Materiales).
- **BCrypt**: Algoritmo de hash de contraseñas.

## 4. Aspectos Técnicos

### **Arquitectura del Sistema**

El sistema **Proscience Lab - PLM/LIMS** está construido con una arquitectura de tres capas:

1. **Capa de Presentación (Frontend)**: Aplicación web desarrollada con React 18.2.0 y Vite 7.2.2
2. **Capa de Lógica de Negocio (Backend)**: API REST desarrollada con Spring Boot 4.0.0 y Java 21
3. **Capa de Datos**: Base de datos relacional MySQL 8.0

### **Requerimientos de Hardware y Software**

#### **Servidor de Desarrollo**

- **Procesador**: 2 CPUs mínimo (4 CPUs recomendado)
- **Memoria RAM**: 8 GB mínimo (16 GB recomendado)
- **Espacio en Disco**: 50 GB mínimo (100 GB recomendado)
- **Sistema Operativo**: 
  - Windows 10/11 o superior
  - Linux (Ubuntu 20.04 LTS o superior)
  - macOS 10.15 o superior

#### **Servidor de Producción**

- **Procesador**: 4 CPUs mínimo (8 CPUs recomendado)
- **Memoria RAM**: 16 GB mínimo (32 GB recomendado)
- **Espacio en Disco**: 100 GB mínimo (200 GB recomendado para datos y backups)
- **Sistema Operativo**: 
  - Windows Server 2019 o superior
  - Linux (Ubuntu 20.04 LTS o superior, CentOS 8 o superior)

#### **Base de Datos**

- **MySQL**: Versión 8.0 o superior
- **Motor de Almacenamiento**: InnoDB
- **Charset**: UTF-8 (utf8mb4)
- **Espacio en Disco**: 20 GB mínimo para datos iniciales

#### **Software Adicional**

- **Navegador Web**: Chrome 90+, Firefox 88+, Edge 90+, Safari 14+ (versiones recientes)
- **Herramienta de Administración de Base de Datos**: MySQL Workbench 8.0 o superior
- **Cliente Git**: Para control de versiones (opcional)

### **Stack Tecnológico**

#### **Backend**

- **Framework**: Spring Boot 4.0.0
- **Lenguaje**: Java 21
- **ORM**: Hibernate / Spring Data JPA
- **Seguridad**: Spring Security con JWT
- **Build Tool**: Apache Maven
- **Base de Datos**: MySQL 8.0
- **Librerías Principales**:
  - Spring Boot Starter Web MVC
  - Spring Boot Starter Data JPA
  - Spring Boot Starter Security
  - Spring Boot Starter Validation
  - Spring Boot Starter Actuator
  - JWT (jjwt 0.12.3)
  - Lombok
  - MySQL Connector/J

#### **Frontend**

- **Framework**: React 18.2.0
- **Build Tool**: Vite 7.2.2
- **Lenguaje**: JavaScript (ES6+)
- **Estilos**: Tailwind CSS 3.3.6
- **Routing**: React Router DOM 6.20.0
- **HTTP Client**: Axios 1.6.2
- **Iconos**: Lucide React 0.294.0
- **PWA**: Vite Plugin PWA
- **Linting**: ESLint 8.55.0

### **Requerimientos de Red**

- **Conexión a Internet**: Requerida para:
  - Descarga de dependencias (Maven, npm)
  - Actualizaciones del sistema
  - Integración con OpenAI API
  - Acceso a servicios cloud (Vercel, Railway, Azure)

- **Puertos Requeridos (Desarrollo Local)**:
  - **Puerto 3001**: Backend API (Spring Boot)
  - **Puerto 3000**: Frontend (Vite Dev Server)
  - **Puerto 3306**: MySQL Database (por defecto)

- **Puertos Requeridos (Producción Cloud)**:
  - **Vercel**: HTTPS automático en puerto 443 (configurado automáticamente)
  - **Railway**: HTTPS automático en puerto 443 (configurado automáticamente)
  - **Azure MySQL**: Puerto 3306 con SSL requerido (accesible desde servicios autorizados)

### **Servicios Externos**

- **OpenAI API**: Requerida para funcionalidades de inteligencia artificial (generación de ideas, análisis de BOMs)
  - Obtener API Key en: https://platform.openai.com/api-keys
  - Configurar variable de entorno `OPENAI_API_KEY`

## 5. Requisitos de Configuración

### **Instalación de Java y Maven**

#### **Java Development Kit (JDK) 21**

1. **Descargar JDK 21**:
   - Windows: Descargar desde [Oracle](https://www.oracle.com/java/technologies/downloads/#java21) o [Adoptium](https://adoptium.net/)
   - Linux: `sudo apt install openjdk-21-jdk` (Ubuntu/Debian)
   - macOS: `brew install openjdk@21`

2. **Configurar Variables de Entorno**:
   ```bash
   # Windows
   JAVA_HOME=C:\Program Files\Java\jdk-21
   PATH=%JAVA_HOME%\bin;%PATH%
   
   # Linux/macOS
   export JAVA_HOME=/usr/lib/jvm/java-21-openjdk
   export PATH=$JAVA_HOME/bin:$PATH
   ```

3. **Verificar Instalación**:
   ```bash
   java -version
   # Debe mostrar: openjdk version "21"...
   ```

#### **Apache Maven**

1. **Descargar Maven**: Desde [Apache Maven](https://maven.apache.org/download.cgi)
2. **Configurar Variables de Entorno**:
   ```bash
   # Windows
   MAVEN_HOME=C:\Program Files\Apache\maven
   PATH=%MAVEN_HOME%\bin;%PATH%
   
   # Linux/macOS
   export MAVEN_HOME=/usr/local/apache-maven
   export PATH=$MAVEN_HOME/bin:$PATH
   ```

3. **Verificar Instalación**:
   ```bash
   mvn -version
   ```

### **Instalación de Node.js y npm**

1. **Descargar Node.js**: Versión 18.x o superior desde [Node.js](https://nodejs.org/)
2. **Verificar Instalación**:
   ```bash
   node -version
   npm -version
   ```

### **Instalación de MySQL**

1. **Descargar MySQL**: Desde el [sitio oficial de MySQL](https://dev.mysql.com/downloads/installer/)
2. **Instalar MySQL Server**: 
   - Seguir el asistente de instalación
   - Configurar la contraseña del usuario root
   - Configurar el puerto (3306 por defecto)
   - Seleccionar charset: utf8mb4

3. **Configurar MySQL Workbench**: 
   - Instalar MySQL Workbench para gestión visual de la base de datos
   - Conectarse al servidor MySQL con las credenciales configuradas

4. **Verificar Instalación**:
   ```bash
   mysql --version
   ```

### **Dependencias del Proyecto**

#### **Backend (Maven Dependencies)**

Las dependencias se gestionan automáticamente mediante Maven. Al ejecutar `mvn install`, se descargarán todas las dependencias necesarias:

- Spring Boot Starters (Web, Data JPA, Security, Validation, Actuator)
- MySQL Connector/J
- JWT Libraries (jjwt-api, jjwt-impl, jjwt-jackson)
- Lombok
- Jackson (para serialización JSON)

#### **Frontend (npm Dependencies)**

Las dependencias se gestionan mediante npm. Al ejecutar `npm install`, se instalarán:

- **Dependencias de Producción**:
  - react, react-dom
  - react-router-dom
  - axios
  - lucide-react
  - date-fns

- **Dependencias de Desarrollo**:
  - vite
  - @vitejs/plugin-react
  - tailwindcss
  - postcss
  - autoprefixer
  - eslint
  - vite-plugin-pwa

### **Configuraciones Adicionales**

#### **Configuración de Base de Datos**

1. **Crear Base de Datos**:
   ```sql
   CREATE DATABASE IF NOT EXISTS proscience 
   CHARACTER SET utf8mb4 
   COLLATE utf8mb4_unicode_ci;
   ```

2. **Importar Esquema SQL**:
   - Ejecutar el archivo `schema.sql` ubicado en `backend_java/plm/src/main/resources/schema.sql`
   - O seguir las instrucciones del Manual de Configuración de BD (PT-MCBD-01)

#### **Configuración del Backend**

1. **Configurar Variables de Entorno**:
   - Copiar `application.properties.example` a `application.properties`
   - Editar `application.properties` con las credenciales de la base de datos:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/proscience?useSSL=false&serverTimezone=America/Bogota&allowPublicKeyRetrieval=true
   spring.datasource.username=root
   spring.datasource.password=tu_contraseña
   ```

2. **Configurar JWT Secret**:
   ```properties
   jwt.secret=tu_secret_key_muy_segura_minimo_256_bits
   jwt.expiration=86400000
   ```

3. **Configurar OpenAI API Key**:
   ```properties
   openai.api.key=tu_api_key_de_openai
   ```
   O configurar variable de entorno:
   ```bash
   export OPENAI_API_KEY=tu_api_key_de_openai
   ```

#### **Configuración del Frontend**

1. **Configurar URL del API**:
   - Crear archivo `.env` en la raíz del proyecto `front_end/`:
   ```env
   VITE_API_URL=http://localhost:3001/api
   ```
   - Para producción, cambiar a la URL del servidor:
   ```env
   VITE_API_URL=https://api.proscience.com/api
   ```

## 6. Proceso de Configuración o Despliegue

### **Instalación de la Aplicación (Desarrollo)**

#### **1. Clonar el Repositorio**

```bash
git clone [URL del repositorio]
cd PLM
```

#### **2. Configurar Backend**

```bash
# Navegar al directorio del backend
cd backend_java/plm

# Instalar dependencias Maven (descarga automática)
mvn clean install

# O si prefieres solo descargar dependencias sin compilar
mvn dependency:resolve
```

#### **3. Configurar Base de Datos**

1. **Crear la Base de Datos**:
   ```sql
   CREATE DATABASE IF NOT EXISTS proscience 
   CHARACTER SET utf8mb4 
   COLLATE utf8mb4_unicode_ci;
   ```

2. **Ejecutar Scripts SQL**:
   - Abrir MySQL Workbench
   - Conectarse al servidor MySQL
   - Ejecutar el archivo `schema.sql` desde `backend_java/plm/src/main/resources/schema.sql`
   - Ejecutar migraciones si existen: `migration_ideas_update.sql`, `migration_roles.sql`

#### **4. Configurar Archivo de Propiedades del Backend**

```bash
# Copiar archivo de ejemplo
cd backend_java/plm/src/main/resources
cp application.properties.example application.properties

# Editar application.properties con tus credenciales
# Usar editor de texto o IDE
```

Editar `application.properties`:
```properties
# Base de datos
spring.datasource.url=jdbc:mysql://localhost:3306/proscience?useSSL=false&serverTimezone=America/Bogota&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=tu_contraseña_mysql

# JWT
jwt.secret=tu_secret_key_segura_minimo_256_bits_cambiar_en_produccion
jwt.expiration=86400000

# OpenAI
openai.api.key=tu_api_key_de_openai
```

#### **5. Configurar Frontend**

```bash
# Navegar al directorio del frontend
cd front_end

# Instalar dependencias npm
npm install

# Crear archivo .env para configuración
echo "VITE_API_URL=http://localhost:3001/api" > .env
```

#### **6. Iniciar la Aplicación**

**Terminal 1 - Backend**:
```bash
cd backend_java/plm
mvn spring-boot:run
```

El backend estará disponible en: `http://localhost:3001`

**Terminal 2 - Frontend**:
```bash
cd front_end
npm run dev
```

El frontend estará disponible en: `http://localhost:3000`

### **Despliegue en Producción (Plataformas Cloud)**

El sistema se desplegará utilizando las siguientes plataformas cloud:

- **Frontend**: Vercel
- **Backend**: Railway
- **Base de Datos**: Azure Database for MySQL

#### **1. Configurar Base de Datos en Azure**

1. **Crear Azure Database for MySQL**:

   a. Acceder al [Portal de Azure](https://portal.azure.com)
   
   b. Crear un nuevo recurso: **Azure Database for MySQL flexible server**
   
   c. **Configuración Básica**:
      - **Nombre del servidor**: `proscience-mysql` (o el que prefieras)
      - **Región**: Seleccionar la región más cercana
      - **Versión de MySQL**: 8.0
      - **Tipo de carga de trabajo**: Desarrollo (para desarrollo) o Producción (para producción)
   
   d. **Configuración de Red**:
      - **Método de conectividad**: Punto de acceso público
      - **Reglas de firewall**: Agregar regla para permitir acceso desde Railway (ver IP más abajo)
      - Permitir acceso desde servicios de Azure: **Sí**
   
   e. **Configuración de Seguridad**:
      - **Nombre de usuario administrador**: `proscience_admin` (o el que prefieras)
      - **Contraseña**: Generar contraseña segura (guardarla en un lugar seguro)
   
   f. **Configuración Adicional**:
      - **Tamaño de almacenamiento**: 20 GB mínimo (ajustar según necesidades)
      - **Backup automático**: Habilitado
      - **Retención de backup**: 7 días (recomendado)

2. **Obtener Cadena de Conexión**:

   a. En el portal de Azure, ir a **Cadenas de conexión** en el recurso de MySQL
   
   b. Copiar la cadena de conexión JDBC, será algo como:
   ```
   jdbc:mysql://proscience-mysql.mysql.database.azure.com:3306/proscience?useSSL=true&requireSSL=true&serverTimezone=America/Bogota
   ```
   
   c. **Guardar las siguientes credenciales**:
      - Host: `proscience-mysql.mysql.database.azure.com`
      - Puerto: `3306`
      - Usuario: `proscience_admin`
      - Contraseña: (la configurada)
      - Base de datos: `proscience`

3. **Configurar Firewall de Azure**:

   a. En el recurso de MySQL, ir a **Seguridad de red**
   
   b. Agregar regla de firewall para Railway:
      - **Nombre de regla**: `railway-backend`
      - **IP inicial**: (se obtendrá después de desplegar en Railway)
      - **IP final**: (misma que inicial)
   
   c. **Nota**: Railway puede usar IPs dinámicas. Considerar usar **"Permitir acceso público desde cualquier servicio de Azure"** temporalmente para desarrollo, o configurar una IP estática en Railway.

4. **Crear Base de Datos y Ejecutar Scripts**:

   a. Conectarse a la base de datos usando MySQL Workbench o Azure Cloud Shell:
   ```bash
   mysql -h proscience-mysql.mysql.database.azure.com -u proscience_admin -p
   ```
   
   b. Crear la base de datos:
   ```sql
   CREATE DATABASE proscience CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   USE proscience;
   ```
   
   c. Ejecutar el script de esquema:
   ```sql
   -- Copiar y pegar el contenido de schema.sql
   -- O importar desde archivo
   SOURCE /ruta/a/schema.sql;
   ```
   
   d. Ejecutar migraciones si existen:
   ```sql
   SOURCE /ruta/a/migration_ideas_update.sql;
   SOURCE /ruta/a/migration_roles.sql;
   ```

#### **2. Desplegar Backend en Railway**

1. **Preparar el Proyecto**:

   a. Asegurarse de que el código esté en un repositorio Git (GitHub, GitLab, etc.)
   
   b. Verificar que existe un archivo `pom.xml` en `backend_java/plm/`

2. **Crear Proyecto en Railway**:

   a. Acceder a [Railway](https://railway.app) e iniciar sesión
   
   b. Hacer clic en **"New Project"**
   
   c. Seleccionar **"Deploy from GitHub repo"** (o el proveedor Git que uses)
   
   d. Seleccionar el repositorio y la rama (ej: `main`)

3. **Configurar el Servicio**:

   a. Railway detectará automáticamente que es un proyecto Java/Maven
   
   b. **Configurar Root Directory**:
      - En la configuración del servicio, establecer **Root Directory**: `backend_java/plm`
   
   c. **Configurar Build Command** (si es necesario):
      ```
      mvn clean package -DskipTests
      ```
   
   d. **Configurar Start Command**:
      ```
      java -jar target/plm-0.0.1-SNAPSHOT.jar
      ```

4. **Configurar Variables de Entorno en Railway**:

   a. En el servicio de Railway, ir a la pestaña **Variables**
   
   b. Agregar las siguientes variables de entorno:
   
   ```env
   # Base de Datos Azure
   SPRING_DATASOURCE_URL=jdbc:mysql://proscience-mysql.mysql.database.azure.com:3306/proscience?useSSL=true&requireSSL=true&serverTimezone=America/Bogota&allowPublicKeyRetrieval=true
   SPRING_DATASOURCE_USERNAME=proscience_admin
   SPRING_DATASOURCE_PASSWORD=tu_contraseña_azure
   SPRING_DATASOURCE_DRIVER_CLASS_NAME=com.mysql.cj.jdbc.Driver
   
   # JPA/Hibernate
   SPRING_JPA_HIBERNATE_DDL_AUTO=validate
   SPRING_JPA_SHOW_SQL=false
   SPRING_JPA_PROPERTIES_HIBERNATE_DIALECT=org.hibernate.dialect.MySQLDialect
   
   # JWT
   JWT_SECRET=tu_secret_key_muy_seguro_minimo_256_bits_generar_aleatorio
   JWT_EXPIRATION=86400000
   JWT_HEADER=Authorization
   JWT_PREFIX=Bearer 
   
   # OpenAI
   OPENAI_API_KEY=tu_api_key_de_openai
   
   # Aplicación
   SPRING_APPLICATION_NAME=plm
   SERVER_PORT=3001
   SERVER_SERVLET_CONTEXT_PATH=/
   
   # Logging
   LOGGING_LEVEL_ROOT=INFO
   LOGGING_LEVEL_COM_PLM_PLM=INFO
   ```
   
   c. **Generar JWT Secret**:
      ```bash
      # En terminal local
      openssl rand -base64 32
      ```
      Usar el resultado como valor de `JWT_SECRET`

5. **Configurar Dominio Público**:

   a. En Railway, ir a la pestaña **Settings**
   
   b. En **Networking**, hacer clic en **"Generate Domain"**
   
   c. Se generará una URL como: `https://plm-production.up.railway.app`
   
   d. **Copiar esta URL** - se usará para configurar CORS en el backend y la URL del API en el frontend

6. **Actualizar Firewall de Azure**:

   a. Obtener la IP pública de Railway (puede ser dinámica)
   
   b. En Azure, agregar regla de firewall con la IP de Railway
   
   c. **Alternativa**: Usar **"Permitir acceso público desde cualquier servicio de Azure"** si Railway está en Azure

7. **Verificar Despliegue**:

   a. Railway iniciará el build automáticamente
   
   b. Revisar los logs en Railway para verificar que la aplicación inició correctamente
   
   c. Probar el endpoint de health:
      ```
      https://tu-dominio-railway.up.railway.app/actuator/health
      ```

#### **3. Desplegar Frontend en Vercel**

1. **Preparar el Proyecto**:

   a. Asegurarse de que el código esté en un repositorio Git
   
   b. Verificar que existe `package.json` en `front_end/`

2. **Crear Proyecto en Vercel**:

   a. Acceder a [Vercel](https://vercel.com) e iniciar sesión
   
   b. Hacer clic en **"Add New..."** → **"Project"**
   
   c. Importar el repositorio Git

3. **Configurar el Proyecto**:

   a. **Framework Preset**: Vercel detectará automáticamente Vite
   
   b. **Root Directory**: Establecer como `front_end`
   
   c. **Build Command**: `npm run build` (ya configurado por defecto)
   
   d. **Output Directory**: `dist` (ya configurado por defecto)
   
   e. **Install Command**: `npm install` (ya configurado por defecto)

4. **Configurar Variables de Entorno en Vercel**:

   a. En la configuración del proyecto, ir a **Environment Variables**
   
   b. Agregar la variable:
   
   ```env
   VITE_API_URL=https://tu-dominio-railway.up.railway.app/api
   ```
   
   c. **Importante**: Reemplazar `tu-dominio-railway.up.railway.app` con la URL real de Railway obtenida en el paso anterior

5. **Configurar CORS en Backend**:

   a. Actualizar `WebConfig.java` en el backend para incluir el dominio de Vercel:
   
   ```java
   registry.addMapping("/api/**")
       .allowedOrigins(
           "http://localhost:3000", 
           "http://localhost:5173",
           "https://tu-proyecto.vercel.app"  // Agregar dominio de Vercel
       )
       .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
       .allowedHeaders("Content-Type", "Authorization")
       .allowCredentials(true)
       .maxAge(3600);
   ```
   
   b. Hacer commit y push - Railway redeployará automáticamente

6. **Desplegar**:

   a. Hacer clic en **"Deploy"**
   
   b. Vercel construirá y desplegará la aplicación automáticamente
   
   c. Se generará una URL como: `https://tu-proyecto.vercel.app`

7. **Configurar Dominio Personalizado (Opcional)**:

   a. En Vercel, ir a **Settings** → **Domains**
   
   b. Agregar dominio personalizado (ej: `app.proscience.com`)
   
   c. Seguir las instrucciones para configurar DNS

#### **4. Verificar Configuración Completa**

1. **Verificar Backend**:
   - Acceder a: `https://tu-dominio-railway.up.railway.app/actuator/health`
   - Debe responder con estado `{"status":"UP"}`

2. **Verificar Frontend**:
   - Acceder a: `https://tu-proyecto.vercel.app`
   - Debe cargar la página de login

3. **Verificar Conexión Frontend-Backend**:
   - Abrir DevTools del navegador (F12)
   - Intentar hacer login
   - Verificar que las peticiones a `/api/*` se completen correctamente
   - No debe haber errores de CORS

4. **Verificar Base de Datos**:
   - Conectarse a Azure MySQL desde MySQL Workbench
   - Verificar que las tablas existan:
   ```sql
   USE proscience;
   SHOW TABLES;
   ```

#### **5. Configuraciones Adicionales de Producción**

1. **Backups Automáticos en Azure**:
   - Azure Database for MySQL realiza backups automáticos
   - Configurar retención según necesidades (7-35 días)
   - Los backups se pueden restaurar desde el portal de Azure

2. **Monitoreo**:
   - **Railway**: Revisar logs en tiempo real en el dashboard
   - **Vercel**: Revisar logs y analytics en el dashboard
   - **Azure**: Configurar alertas y métricas en Azure Monitor

3. **Escalabilidad**:
   - **Railway**: Escalar automáticamente según tráfico (configurar en Settings)
   - **Vercel**: Escalado automático incluido
   - **Azure MySQL**: Escalar el tier según necesidades desde el portal

4. **SSL/HTTPS**:
   - **Vercel**: SSL automático incluido (Let's Encrypt)
   - **Railway**: SSL automático incluido
   - **Azure MySQL**: SSL requerido por defecto (useSSL=true)

## 7. Ingreso al Sistema

### **Acceso Web**

1. **URL de Acceso**:
   - **Desarrollo**: `http://localhost:3000`
   - **Producción**: `https://tu-proyecto.vercel.app` (URL generada por Vercel)
   - **Producción (Dominio Personalizado)**: `https://app.proscience.com` (si se configuró dominio personalizado)

2. **Página de Login**:
   - Al acceder a la aplicación, se mostrará la página de inicio de sesión
   - Ingresar con las credenciales de usuario
   - El frontend se conectará automáticamente al backend en Railway

### **Credenciales Iniciales**

Después de ejecutar el script de inicialización de datos (`DataInitializer`), se crean usuarios de ejemplo:

- **Administrador**:
  - Email: `admin@proscience.com`
  - Contraseña: (configurada en `DataInitializer.java`)

> ⚠️ **IMPORTANTE**: Cambiar las contraseñas por defecto inmediatamente después del primer acceso en producción.

### **Verificación del Sistema**

1. **Verificar Funcionalidades**:
   - ✅ Login y autenticación
   - ✅ Dashboard principal
   - ✅ Gestión de Ideas
   - ✅ Gestión de Inventario (Productos, Materiales, Categorías)
   - ✅ Gestión de BOMs
   - ✅ Gestión de Pruebas de Laboratorio
   - ✅ Integración con IA (OpenAI)

2. **Verificar Conexión con Backend**:
   - Abrir DevTools del navegador (F12)
   - Verificar que las peticiones a `/api/*` se completen correctamente
   - Verificar que no haya errores de CORS

3. **Verificar Base de Datos**:
   ```sql
   -- Verificar tablas creadas
   SHOW TABLES;
   
   -- Verificar usuarios
   SELECT * FROM usuarios;
   
   -- Verificar productos
   SELECT * FROM productos;
   ```

## 8. Otras Consideraciones

### **Mantenimiento y Soporte**

#### **Actualizaciones**

- **Backend**: 
  - Mantener Spring Boot y dependencias actualizadas
  - Revisar vulnerabilidades de seguridad regularmente
  - Ejecutar `mvn versions:display-dependency-updates` para ver actualizaciones disponibles

- **Frontend**:
  - Mantener React y dependencias actualizadas
  - Ejecutar `npm outdated` para ver paquetes desactualizados
  - Actualizar con `npm update`

- **Base de Datos**:
  - Mantener MySQL actualizado con los últimos parches de seguridad
  - Revisar logs de MySQL regularmente

#### **Soporte Técnico**

- **Logs del Backend**: Revisar logs en tiempo real en el dashboard de Railway
- **Logs del Frontend**: 
  - Revisar consola del navegador (DevTools)
  - Revisar logs en el dashboard de Vercel
- **Logs de Base de Datos**: Revisar logs en Azure Portal → Azure Database for MySQL → Logs del servidor

### **Respaldo y Recuperación**

#### **Backup de Base de Datos**

1. **Backups Automáticos en Azure**:
   - Azure Database for MySQL realiza backups automáticos diarios
   - Los backups se retienen según la configuración (7-35 días por defecto)
   - Acceder a backups desde Azure Portal → Azure Database for MySQL → Backups

2. **Backup Manual desde Azure Portal**:
   - Ir a Azure Portal → Azure Database for MySQL
   - Seleccionar **Backups** en el menú
   - Hacer clic en **"Backup now"** para crear un backup manual

3. **Backup Manual desde Línea de Comandos**:
   ```bash
   # Conectarse a Azure MySQL y hacer dump
   mysqldump -h proscience-mysql.mysql.database.azure.com \
     -u proscience_admin -p \
     --ssl-mode=REQUIRED \
     proscience > backup_proscience_$(date +%Y%m%d_%H%M%S).sql
   ```

4. **Exportar Backup desde Azure**:
   - En Azure Portal, ir a **Backups**
   - Seleccionar un backup y hacer clic en **"Download"**
   - El backup se descargará como archivo `.sql`

#### **Restauración de Base de Datos**

1. **Restaurar desde Azure Portal**:
   - Ir a Azure Portal → Azure Database for MySQL
   - Seleccionar **Backups**
   - Seleccionar el backup a restaurar
   - Hacer clic en **"Restore"**
   - Se creará un nuevo servidor con los datos restaurados

2. **Restaurar desde Archivo SQL**:
   ```bash
   mysql -h proscience-mysql.mysql.database.azure.com \
     -u proscience_admin -p \
     --ssl-mode=REQUIRED \
     proscience < backup_proscience_20250110.sql
   ```

#### **Backup de Código**

- Mantener el código en un repositorio Git
- Realizar commits regulares
- Usar tags para versiones de producción

#### **Plan de Recuperación**

1. **Recuperación de Datos**: Restaurar desde backup más reciente
2. **Recuperación de Aplicación**: Recompilar y redesplegar desde repositorio Git
3. **Recuperación Completa**: Restaurar servidor desde snapshot/backup completo

### **Seguridad**

#### **Revisión de Seguridad**

- **Auditorías Periódicas**: Realizar auditorías de seguridad cada trimestre
- **Actualización de Dependencias**: Revisar vulnerabilidades conocidas (CVE)
- **Análisis de Código**: Usar herramientas como SonarQube para análisis estático

#### **Protección de Datos**

- **Encriptación de Contraseñas**: Usar BCrypt (ya implementado)
- **HTTPS**: Usar SSL/TLS en producción (obligatorio)
- **JWT Secret**: Usar secret fuerte y único en producción
- **Variables de Entorno**: No commitear credenciales en el código
- **Firewall**: Restringir acceso a puertos innecesarios
- **Backup Encriptado**: Encriptar backups de base de datos

#### **Configuraciones de Seguridad Adicionales**

1. **CORS**: Configurar correctamente en `WebConfig.java` para producción
2. **Rate Limiting**: Considerar implementar rate limiting para APIs
3. **SQL Injection**: Usar parámetros preparados (ya implementado con JPA)
4. **XSS Protection**: React escapa automáticamente, pero validar inputs

### **Monitoreo y Performance**

#### **Monitoreo de Aplicación**

- **Spring Boot Actuator**: Ya incluido, acceder a `https://tu-dominio-railway.up.railway.app/actuator/health`
- **Railway Monitoring**: 
  - Revisar métricas en tiempo real en el dashboard de Railway
  - Monitorear uso de CPU, memoria y red
  - Revisar logs en tiempo real
- **Vercel Analytics**: 
  - Habilitar Vercel Analytics para métricas del frontend
  - Revisar performance y errores en el dashboard
- **Azure Monitor**: 
  - Configurar alertas en Azure Portal para la base de datos
  - Revisar métricas de rendimiento y conexiones
- **Métricas Adicionales**: Considerar integrar servicios como Datadog, New Relic o Sentry para monitoreo avanzado

#### **Optimización de Performance**

- **Base de Datos**: 
  - Índices ya configurados en las tablas
  - Revisar consultas lentas con `EXPLAIN`
  - Optimizar queries frecuentes

- **Backend**:
  - Connection pooling (HikariCP ya configurado)
  - Cache de consultas frecuentes (considerar Redis)

- **Frontend**:
  - Code splitting (Vite lo hace automáticamente)
  - Lazy loading de rutas
  - Optimización de imágenes

### **Escalabilidad**

#### **Escalabilidad Horizontal**

- **Backend (Railway)**: 
  - Railway escala automáticamente según el tráfico
  - Configurar auto-scaling en Settings → Scaling
  - Considerar múltiples instancias si es necesario
- **Base de Datos (Azure)**: 
  - Configurar réplicas de lectura en Azure Portal
  - Usar Azure Database for MySQL Flexible Server para mejor escalabilidad
- **Frontend (Vercel)**: 
  - Vercel incluye CDN global automáticamente
  - Los archivos estáticos se sirven desde edge locations
  - Escalado automático incluido

#### **Escalabilidad Vertical**

- **Railway**: 
  - Actualizar el plan de Railway según necesidad
  - Configurar recursos en Settings → Resources
- **Azure MySQL**: 
  - Escalar el tier de la base de datos desde Azure Portal
  - Opciones: Burstable, General Purpose, Memory Optimized
  - Escalar almacenamiento según necesidad
- **Monitoreo**: 
  - Monitorear uso de CPU, RAM y disco en todas las plataformas
  - Configurar alertas para escalar proactivamente

### **Documentación Adicional**

- **Manual de Usuario**: Documentar funcionalidades para usuarios finales
- **Manual de Base de Datos**: Ver PT-MCBD-01
- **API Documentation**: Considerar Swagger/OpenAPI para documentar endpoints
- **Changelog**: Mantener registro de cambios y versiones

### **Troubleshooting Común**

#### **Problema: Backend no inicia en Railway**

- Verificar variables de entorno en Railway (especialmente SPRING_DATASOURCE_URL)
- Revisar logs en Railway dashboard para errores específicos
- Verificar que el build se completó correctamente
- Verificar que Java 21 esté disponible (Railway lo detecta automáticamente)
- Verificar que el puerto esté configurado correctamente (Railway asigna puerto automáticamente)

#### **Problema: Frontend no se conecta al Backend**

- Verificar variable de entorno `VITE_API_URL` en Vercel
- Verificar que la URL de Railway sea correcta y accesible
- Verificar CORS en `WebConfig.java` - debe incluir el dominio de Vercel
- Verificar que el backend esté corriendo en Railway (revisar logs)
- Revisar consola del navegador (F12) para errores específicos
- Verificar que no haya problemas de red entre Vercel y Railway

#### **Problema: Error de autenticación**

- Verificar variable de entorno `JWT_SECRET` en Railway
- Verificar que el token no haya expirado (revisar `JWT_EXPIRATION`)
- Revisar logs de Spring Security en Railway
- Verificar que el header `Authorization` se esté enviando correctamente

#### **Problema: Error de conexión a base de datos Azure**

- Verificar que el servidor MySQL de Azure esté corriendo (Azure Portal)
- Verificar credenciales en variables de entorno de Railway:
  - `SPRING_DATASOURCE_URL`
  - `SPRING_DATASOURCE_USERNAME`
  - `SPRING_DATASOURCE_PASSWORD`
- Verificar que la base de datos `proscience` exista en Azure
- Verificar reglas de firewall en Azure:
  - Debe permitir conexiones desde Railway (agregar IP de Railway)
  - O habilitar "Permitir acceso público desde servicios de Azure"
- Verificar que la cadena de conexión incluya `useSSL=true&requireSSL=true`
- Probar conexión desde MySQL Workbench con las mismas credenciales

#### **Problema: Frontend no se despliega en Vercel**

- Verificar que el root directory esté configurado como `front_end`
- Verificar que `package.json` exista en `front_end/`
- Revisar logs de build en Vercel para errores específicos
- Verificar que todas las dependencias estén en `package.json`
- Verificar que el comando de build sea `npm run build`

#### **Problema: Cambios no se reflejan después del despliegue**

- **Railway**: Verificar que el código se haya pusheado al repositorio Git
- **Vercel**: Verificar que el build se haya completado correctamente
- Limpiar caché del navegador (Ctrl+Shift+R o Cmd+Shift+R)
- Verificar que las variables de entorno se hayan actualizado correctamente

---

**Fin del Documento**

