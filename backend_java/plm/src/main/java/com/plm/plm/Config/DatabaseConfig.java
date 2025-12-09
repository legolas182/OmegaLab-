package com.plm.plm.Config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import jakarta.persistence.EntityManagerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;
import java.net.URI;
import java.util.Properties;

/**
 * Configuración de base de datos para Railway
 * Convierte MYSQL_URL de Railway (formato mysql://) a formato JDBC
 * Lee explícitamente las variables de entorno del sistema para conectar
 * a la base de datos MySQL separada en Railway
 */
@Configuration
@Profile("prod")
@EnableTransactionManagement
public class DatabaseConfig {

    @Value("${spring.jpa.hibernate.ddl-auto:update}")
    private String ddlAuto;

    @Value("${spring.jpa.show-sql:false}")
    private String showSql;

    @Value("${spring.jpa.properties.hibernate.dialect:org.hibernate.dialect.MySQLDialect}")
    private String hibernateDialect;

    @Value("${spring.jpa.properties.hibernate.format_sql:false}")
    private String formatSql;

    @Value("${spring.jpa.properties.hibernate.use_sql_comments:false}")
    private String useSqlComments;

    /**
     * Obtiene una variable de entorno del sistema.
     * Primero intenta desde variables de entorno, luego desde propiedades de Spring.
     * También limpia comillas dobles que puedan estar alrededor del valor.
     */
    private String getEnv(String key, String defaultValue) {
        String value = System.getenv(key);
        if (value == null || value.isEmpty()) {
            // Si no está en variables de entorno, intentar desde propiedades de Spring
            value = System.getProperty(key, defaultValue);
        }
        // Limpiar comillas dobles si están presentes (Railway a veces las agrega)
        if (value != null && value.startsWith("\"") && value.endsWith("\"")) {
            value = value.substring(1, value.length() - 1);
        }
        return value != null ? value : defaultValue;
    }

    private String getMysqlUrl() {
        return getEnv("MYSQL_URL", "");
    }

    private String getMysqlHost() {
        return getEnv("MYSQLHOST", "");
    }

    private String getMysqlPort() {
        return getEnv("MYSQLPORT", "3306");
    }

    private String getMysqlDatabase() {
        return getEnv("MYSQLDATABASE", "");
    }

    private String getMysqlUser() {
        return getEnv("MYSQLUSER", "root");
    }

    private String getMysqlPassword() {
        return getEnv("MYSQLPASSWORD", "");
    }

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();
        
        // Leer variables de entorno explícitamente
        String mysqlUrl = getMysqlUrl();
        String mysqlHost = getMysqlHost();
        String mysqlPort = getMysqlPort();
        String mysqlDatabase = getMysqlDatabase();
        String mysqlUser = getMysqlUser();
        String mysqlPassword = getMysqlPassword();
        
        String jdbcUrl;
        String username;
        String password;
        
        // Intentar usar MYSQL_URL primero (formato Railway)
        if (mysqlUrl != null && !mysqlUrl.isEmpty()) {
            try {
                // MYSQL_URL viene en formato: mysql://user:password@host:port/database
                URI uri = new URI(mysqlUrl.replace("mysql://", "http://"));
                String host = uri.getHost();
                int port = uri.getPort() == -1 ? 3306 : uri.getPort();
                String database = uri.getPath().substring(1); // Remover el "/" inicial
                String[] userInfo = uri.getUserInfo().split(":");
                username = userInfo[0];
                password = userInfo.length > 1 ? userInfo[1] : "";
                
                // Construir URL JDBC
                jdbcUrl = String.format(
                    "jdbc:mysql://%s:%d/%s?useSSL=true&serverTimezone=UTC&allowPublicKeyRetrieval=true",
                    host, port, database
                );
                
                System.out.println("✓ Configuración de base de datos desde MYSQL_URL");
            } catch (Exception e) {
                System.err.println("Error al parsear MYSQL_URL, usando variables individuales: " + e.getMessage());
                // Fallback a variables individuales
                jdbcUrl = buildUrlFromIndividualVariables(mysqlHost, mysqlPort, mysqlDatabase);
                username = mysqlUser;
                password = mysqlPassword;
            }
        } else {
            // Usar variables individuales
            jdbcUrl = buildUrlFromIndividualVariables(mysqlHost, mysqlPort, mysqlDatabase);
            username = mysqlUser;
            password = mysqlPassword;
        }
        
        config.setJdbcUrl(jdbcUrl);
        config.setUsername(username);
        config.setPassword(password);
        config.setDriverClassName("com.mysql.cj.jdbc.Driver");
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(5);
        config.setConnectionTimeout(30000);
        
        return new HikariDataSource(config);
    }

    @Bean(name = "entityManagerFactory")
    @Primary
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(DataSource dataSource) {
        LocalContainerEntityManagerFactoryBean em = new LocalContainerEntityManagerFactoryBean();
        em.setDataSource(dataSource);
        em.setPackagesToScan("com.plm.plm.Models");
        
        HibernateJpaVendorAdapter vendorAdapter = new HibernateJpaVendorAdapter();
        em.setJpaVendorAdapter(vendorAdapter);
        
        Properties properties = new Properties();
        properties.setProperty("hibernate.hbm2ddl.auto", ddlAuto);
        properties.setProperty("hibernate.show_sql", showSql);
        properties.setProperty("hibernate.dialect", hibernateDialect);
        properties.setProperty("hibernate.format_sql", formatSql);
        properties.setProperty("hibernate.use_sql_comments", useSqlComments);
        
        em.setJpaProperties(properties);
        
        return em;
    }

    @Bean
    @Primary
    public PlatformTransactionManager transactionManager(EntityManagerFactory entityManagerFactory) {
        JpaTransactionManager transactionManager = new JpaTransactionManager();
        transactionManager.setEntityManagerFactory(entityManagerFactory);
        return transactionManager;
    }

    private String buildUrlFromIndividualVariables(String mysqlHost, String mysqlPort, String mysqlDatabase) {
        // Debug: mostrar qué variables están disponibles
        String mysqlUser = getMysqlUser();
        String mysqlPassword = getMysqlPassword();
        
        System.out.println("=== Debug: Variables de MySQL desde Variables de Entorno ===");
        System.out.println("MYSQLHOST: " + (mysqlHost != null && !mysqlHost.isEmpty() ? mysqlHost : "NO DISPONIBLE"));
        System.out.println("MYSQLPORT: " + mysqlPort);
        System.out.println("MYSQLDATABASE: " + (mysqlDatabase != null && !mysqlDatabase.isEmpty() ? mysqlDatabase : "NO DISPONIBLE"));
        System.out.println("MYSQLUSER: " + mysqlUser);
        System.out.println("MYSQLPASSWORD: " + (mysqlPassword != null && !mysqlPassword.isEmpty() ? "***CONFIGURADA***" : "NO DISPONIBLE"));
        System.out.println("================================");
        
        // Validar que no sean valores de ejemplo
        if (mysqlHost == null || mysqlHost.isEmpty() || 
            mysqlHost.equals("xxx.railway.internal") || 
            (mysqlHost.startsWith("xxx") && !mysqlHost.contains("railway.app"))) {
            System.err.println("⚠ ERROR: MYSQLHOST contiene un valor de ejemplo o está vacío.");
            System.err.println("⚠ Valor actual: " + mysqlHost);
            System.err.println("");
            System.err.println("📋 CÓMO OBTENER EL VALOR REAL:");
            System.err.println("   1. Ve a tu servicio MySQL en Railway");
            System.err.println("   2. Abre la pestaña 'Variables' o 'Settings'");
            System.err.println("   3. Busca la variable 'MYSQLHOST' o 'MYSQL_HOST'");
            System.err.println("   4. Copia el valor (debería ser algo como: containers-us-west-xxx.railway.app)");
            System.err.println("   5. Si no existe, busca 'Private Networking' o 'Service URL'");
            System.err.println("   6. Ve a tu servicio Backend → Variables");
            System.err.println("   7. Agrega/actualiza MYSQLHOST con el valor copiado");
            System.err.println("");
            System.err.println("💡 NOTA: Si ambos servicios están en el mismo proyecto Railway,");
            System.err.println("   puedes usar el host interno (ej: mysql.railway.internal)");
            System.err.println("   pero debe ser el nombre REAL del servicio, no 'xxx'");
            throw new IllegalStateException("MYSQLHOST no está configurado correctamente. Valor actual: " + mysqlHost + 
                    ". Por favor, obtén el valor real desde las variables de tu servicio MySQL en Railway.");
        }
        
        if (mysqlDatabase == null || mysqlDatabase.isEmpty()) {
            System.err.println("⚠ ERROR: MYSQLDATABASE contiene un valor de ejemplo o está vacío.");
            System.err.println("⚠ Valor actual: " + mysqlDatabase);
            System.err.println("⚠ Por favor, configura MYSQLDATABASE con el nombre real de tu base de datos.");
            throw new IllegalStateException("MYSQLDATABASE no está configurado correctamente. Valor actual: " + mysqlDatabase);
        }
        
        if (mysqlHost != null && !mysqlHost.isEmpty() && 
            mysqlDatabase != null && !mysqlDatabase.isEmpty()) {
            
            String jdbcUrl = String.format(
                "jdbc:mysql://%s:%s/%s?useSSL=true&serverTimezone=UTC&allowPublicKeyRetrieval=true",
                mysqlHost, mysqlPort, mysqlDatabase
            );
            
            System.out.println("✓ Configuración de base de datos desde variables individuales");
            System.out.println("URL JDBC: jdbc:mysql://" + mysqlHost + ":" + mysqlPort + "/" + mysqlDatabase);
            return jdbcUrl;
        } else {
            System.err.println("⚠ ERROR: No se encontraron variables de MySQL en las variables de entorno.");
            System.err.println("⚠ Por favor, configura las siguientes variables en Railway (sección Variables del servicio Backend):");
            System.err.println("   - MYSQLHOST (host de la base de datos MySQL)");
            System.err.println("   - MYSQLPORT (puerto, por defecto 3306)");
            System.err.println("   - MYSQLDATABASE (nombre de la base de datos)");
            System.err.println("   - MYSQLUSER (usuario de MySQL)");
            System.err.println("   - MYSQLPASSWORD (contraseña de MySQL)");
            System.err.println("⚠ O alternativamente, configura MYSQL_URL con el formato: mysql://user:password@host:port/database");
            throw new IllegalStateException("No se pueden encontrar las variables de entorno necesarias para conectar a la base de datos MySQL. " +
                    "Por favor, configura MYSQLHOST, MYSQLPORT, MYSQLDATABASE, MYSQLUSER y MYSQLPASSWORD en Railway.");
        }
    }
}

