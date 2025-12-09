package com.plm.plm.Config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;
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
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();
        
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
                jdbcUrl = buildUrlFromIndividualVariables();
                username = mysqlUser;
                password = mysqlPassword;
            }
        } else {
            // Usar variables individuales
            jdbcUrl = buildUrlFromIndividualVariables();
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

    private String buildUrlFromIndividualVariables() {
        if (mysqlHost != null && !mysqlHost.isEmpty() && 
            mysqlDatabase != null && !mysqlDatabase.isEmpty()) {
            
            String jdbcUrl = String.format(
                "jdbc:mysql://%s:%s/%s?useSSL=true&serverTimezone=UTC&allowPublicKeyRetrieval=true",
                mysqlHost, mysqlPort, mysqlDatabase
            );
            
            System.out.println("✓ Configuración de base de datos desde variables individuales");
            return jdbcUrl;
        } else {
            System.err.println("⚠ No se encontraron variables de MySQL. Usando configuración por defecto.");
            return "jdbc:mysql://localhost:3306/proscience?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
        }
    }
}

