/**
 * SecurityConfig.java
 *
 * @author Jonas Lanz
 */
package com.hsaalen.backend.config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable()) // disable CSRF for dev/testing
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/webassembly/api/files/**").permitAll() // allow api file endpoints
                        .requestMatchers("/webassembly/api/**").permitAll()
                        .anyRequest().authenticated()
                )
                .httpBasic(httpBasic -> httpBasic.disable());

        return http.build();
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:3000", "https://jeek.abrdns.com")
                        .allowedMethods("GET", "POST", "PUT", "DELETE")
                        .exposedHeaders("*")
                        .allowCredentials(false);
            }
        };
    }
}
