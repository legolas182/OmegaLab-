package com.plm.plm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class PlmApplication {

	public static void main(String[] args) {
		SpringApplication.run(PlmApplication.class, args);
	}
}
