package com.plm.plm.Config;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class ApplicationStartupListener implements ApplicationListener<ApplicationReadyEvent> {

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        Environment env = event.getApplicationContext().getEnvironment();
        String port = env.getProperty("server.port", "8080");
        String appName = env.getProperty("spring.application.name", "plm");
        
        System.out.println("========================================");
        System.out.println("✓ " + appName.toUpperCase() + " APLICACIÓN INICIADA EXITOSAMENTE");
        System.out.println("✓ Servidor escuchando en puerto: " + port);
        System.out.println("✓ Perfil activo: " + String.join(", ", env.getActiveProfiles()));
        System.out.println("✓ Health check disponible en: /health");
        System.out.println("✓ Actuator health disponible en: /actuator/health");
        System.out.println("========================================");
    }
}

