package com.plm.plm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
@EnableCaching
public class PlmApplication {

	public static void main(String[] args) {
		// Log del puerto que se usará (Railway asigna PORT automáticamente)
		String port = System.getenv("PORT");
		if (port != null) {
			System.out.println("✓ Puerto asignado por Railway: " + port);
		} else {
			System.out.println("⚠ Variable PORT no encontrada, usando puerto por defecto");
		}
		
		SpringApplication.run(PlmApplication.class, args);
	}
}
