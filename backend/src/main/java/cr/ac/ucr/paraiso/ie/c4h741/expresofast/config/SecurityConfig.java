package cr.ac.ucr.paraiso.ie.c4h741.expresofast.config;

import cr.ac.ucr.paraiso.ie.c4h741.expresofast.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .csrf(csrf -> csrf.disable())
        .sessionManagement(sess -> sess
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        )
        .authorizeHttpRequests(auth -> auth
            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
            .requestMatchers("/api/v1/auth/**", "/api/auth/**").permitAll()

            // LISTAR Y CONSULTAR ENVÍOS (Soluciona el GET /api/v1/envios)
            .requestMatchers(HttpMethod.GET, "/api/v1/envios", "/api/v1/envios/**")
                .hasAnyAuthority("ROLE_ADMIN", "ROLE_OPERADOR", "ROLE_CONDUCTOR")

            .requestMatchers(HttpMethod.POST, "/api/v1/envios")
                .hasAnyAuthority("ROLE_ADMIN", "ROLE_OPERADOR")

            .requestMatchers(HttpMethod.PATCH, "/api/v1/envios/*/estado")
                .hasAnyAuthority("ROLE_ADMIN", "ROLE_CONDUCTOR")

            .requestMatchers(HttpMethod.GET, "/api/v1/envios/*/bitacora")
                .hasAnyAuthority("ROLE_ADMIN", "ROLE_OPERADOR")

            .requestMatchers("/api/v1/vehiculos/**")
                .hasAuthority("ROLE_ADMIN")

                            .requestMatchers(HttpMethod.POST, "/api/envios/con-paquetes")
                .hasAnyAuthority("ROLE_ADMIN", "ROLE_OPERADOR")

            .anyRequest().authenticated()
        )
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
}

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        //agregar el de angular
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
        "http://localhost:5500", "http://127.0.0.1:5500",
        "http://localhost:4200"
));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
        
    }
}