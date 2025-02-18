package com.example.bathymetricapi;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class BathymetricApiApplicationTests {

	@BeforeAll
	static void setUp() {
		System.out.println("✅ Iniciando pruebas de contexto...");
	}

	@Test
	void contextLoads() {
		// Verifica que el contexto de Spring Boot carga correctamente
		System.out.println("✅ Prueba de carga de contexto exitosa.");
	}
}
