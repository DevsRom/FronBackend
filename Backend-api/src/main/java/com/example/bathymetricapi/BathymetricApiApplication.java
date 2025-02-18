package com.example.bathymetricapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication
@EnableJpaRepositories("com.example.bathymetricapi.repository") // ✅ Escanea repositorios JPA
@EntityScan("com.example.bathymetricapi.model") // ✅ Escanea entidades JPA
public class BathymetricApiApplication {
	public static void main(String[] args) {
		SpringApplication.run(BathymetricApiApplication.class, args);
	}
}
