package com.example.bathymetricapi.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .cors(cors -> cors.configurationSource(request -> {
                                        var corsConfig = new org.springframework.web.cors.CorsConfiguration();
                                        corsConfig.addAllowedOriginPattern("*"); // 🔹 Permitir todas las fuentes
                                        corsConfig.addAllowedMethod("*"); // 🔹 Permitir todos los métodos
                                        corsConfig.addAllowedHeader("*"); // 🔹 Permitir todos los headers
                                        return corsConfig;
                                }))
                                .csrf(csrf -> csrf.disable()) // 🔹 Deshabilitar CSRF solo si es necesario
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(
                                                                new org.springframework.security.web.util.matcher.AntPathRequestMatcher(
                                                                                "/api/**"))
                                                .permitAll()
                                                .requestMatchers(
                                                                new org.springframework.security.web.util.matcher.AntPathRequestMatcher(
                                                                                "/h2-console/**"))
                                                .permitAll()
                                                .anyRequest().authenticated())
                                .headers(headers -> headers.frameOptions(frame -> frame.disable())); // 🔹 Necesario
                                                                                                     // para H2 Console

                return http.build();
        }

        @Bean
        public WebMvcConfigurer corsConfigurer() {
                return new WebMvcConfigurer() {
                        @Override
                        public void addCorsMappings(@NonNull CorsRegistry registry) { // ✅ Agregado @NonNull
                                registry.addMapping("/**")
                                                .allowedOrigins("*")
                                                .allowedMethods("*")
                                                .allowedHeaders("*");
                        }
                };
        }
}
