
package com.nexushr.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService(
            PasswordEncoder passwordEncoder) {

        String adminPassword = System.getenv("NEXUS_ADMIN_PASSWORD");
        String hrPassword = System.getenv("NEXUS_HR_PASSWORD");

        if (adminPassword == null || hrPassword == null) {
            throw new IllegalStateException(
                "Set NEXUS_ADMIN_PASSWORD and NEXUS_HR_PASSWORD first."
            );
        }

        var admin = User.withUsername("admin@nexushr.com")
                .password(passwordEncoder.encode(adminPassword))
                .roles("ADMIN")
                .build();

        var hr = User.withUsername("hr@nexushr.com")
                .password(passwordEncoder.encode(hrPassword))
                .roles("HR")
                .build();

        return new InMemoryUserDetailsManager(admin, hr);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            

.authorizeHttpRequests(auth -> auth
    // Allow browser CORS preflight requests
    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

    // Only ADMIN can delete onboarding records
    .requestMatchers(HttpMethod.DELETE, "/api/onboarding/**")
        .hasRole("ADMIN")

    // Only ADMIN can delete performance reviews
    .requestMatchers(HttpMethod.DELETE, "/api/performance/**")
        .hasRole("ADMIN")

    // All remaining API endpoints require ADMIN or HR
    .requestMatchers("/api/**")
        .hasAnyRole("ADMIN", "HR")

    // Non-API resources such as frontend assets remain accessible
    .anyRequest().permitAll()
)

            
            .httpBasic(Customizer.withDefaults());

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(
            List.of(
    "http://localhost:5173",
    "http://localhost:5174"
)
        );
       configuration.setAllowedMethods(
    List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
);
        configuration.setAllowedHeaders(
            List.of("Authorization", "Content-Type")
        );

        UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
