package com.plm.plm.Config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

import java.net.URI;

/**
 * Configuración de base de datos para Railway
 * Convierte MYSQL_URL de Railway (formato mysql://) a formato JDBC
 */
@Configuration
@Profile("prod")
public class DatabaseConfig {

    @Value("${MYSQL_URL:}")
    private String mysqlUrl;

    @Value("${MYSQLHOST:}")
    private String mysqlHost;

    @Value("${MYSQLPORT:3306}")
    private String mysqlPort;

    @Value("${MYSQLDATABASE:}")
    private String mysqlDatabase;

    @Value("${MYSQLUSER:root}")
    private String mysqlUser;

    @Value("${MYSQLPASSWORD:}")
    private String mysqlPassword;

    @Bean
    @Primary
    @ConfigurationProperties("spring.datasource")
    public DataSourceProperties dataSourceProperties() {
        DataSourceProperties properties = new DataSourceProperties();
        
        // Intentar usar MYSQL_URL primero (formato Railway)
        if (mysqlUrl != null && !mysqlUrl.isEmpty()) {
            try {
                // MYSQL_URL viene en formato: mysql://user:password@host:port/database
                URI uri = new URI(mysqlUrl.replace("mysql://", "http://"));
                String host = uri.getHost();
                int port = uri.getPort() == -1 ? 3306 : uri.getPort();
                String database = uri.getPath().substring(1); // Remover el "/" inicial
                String user = uri.getUserInfo().split(":")[0];
                String password = uri.getUserInfo().split(":")[1];
                
                // Construir URL JDBC
                String jdbcUrl = String.format(
                    "jdbc:mysql://%s:%d/%s?useSSL=true&serverTimezone=UTC&allowPublicKeyRetrieval=true",
                    host, port, database
                );
                
                properties.setUrl(jdbcUrl);
                properties.setUsername(user);
                properties.setPassword(password);
                
                System.out.println("✓ Configuración de base de datos desde MYSQL_URL");
            } catch (Exception e) {
                System.err.println("Error al parsear MYSQL_URL, usando variables individuales: " + e.getMessage());
                // Fallback a variables individuales
                buildUrlFromIndividualVariables(properties);
            }
        } else {
            // Usar variables individuales
            buildUrlFromIndividualVariables(properties);
        }
        
        return properties;
    }

    private void buildUrlFromIndividualVariables(DataSourceProperties properties) {
        if (mysqlHost != null && !mysqlHost.isEmpty() && 
            mysqlDatabase != null && !mysqlDatabase.isEmpty()) {
            
            String jdbcUrl = String.format(
                "jdbc:mysql://%s:%s/%s?useSSL=true&serverTimezone=UTC&allowPublicKeyRetrieval=true",
                mysqlHost, mysqlPort, mysqlDatabase
            );
            
            properties.setUrl(jdbcUrl);
            properties.setUsername(mysqlUser);
            properties.setPassword(mysqlPassword);
            
            System.out.println("✓ Configuración de base de datos desde variables individuales");
        } else {
            System.err.println("⚠ No se encontraron variables de MySQL. Usando configuración por defecto.");
        }
    }
}

