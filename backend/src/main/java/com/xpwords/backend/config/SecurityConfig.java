package com.xpwords.backend.config;

import com.xpwords.backend.auth.DiscordAuthSuccessHandler;
import com.xpwords.backend.auth.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CorsConfigurationSource corsConfigurationSource;
    private final DiscordAuthSuccessHandler discordAuthSuccessHandler;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          CorsConfigurationSource corsConfigurationSource,
                          DiscordAuthSuccessHandler discordAuthSuccessHandler) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.corsConfigurationSource = corsConfigurationSource;
        this.discordAuthSuccessHandler = discordAuthSuccessHandler;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/login/**").permitAll()
                .requestMatchers("/oauth2/**").permitAll()
                .requestMatchers("/api/leaderboard").permitAll()
                .requestMatchers("/api/stats").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/resources/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/resources/**").hasAnyRole("TEACHER", "MODERATOR")
                .requestMatchers(HttpMethod.PUT, "/api/resources/**").hasAnyRole("TEACHER", "MODERATOR")
                .requestMatchers(HttpMethod.DELETE, "/api/resources/**").hasAnyRole("TEACHER", "MODERATOR")
                .requestMatchers("/api/classes/**").hasAnyRole("TEACHER", "MODERATOR")
                .requestMatchers(HttpMethod.GET, "/api/class-requests").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/class-requests").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/class-requests/**").hasAnyRole("TEACHER", "MODERATOR")
                .requestMatchers(HttpMethod.GET, "/api/words").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/words/**").hasAnyRole("TEACHER", "MODERATOR")
                .requestMatchers(HttpMethod.PUT, "/api/words/**").hasAnyRole("TEACHER", "MODERATOR")
                .requestMatchers(HttpMethod.DELETE, "/api/words/**").hasAnyRole("TEACHER", "MODERATOR")
                .requestMatchers("/api/games/**").authenticated()
                .requestMatchers("/api/users/students").hasAnyRole("TEACHER", "MODERATOR")
                .requestMatchers("/api/users/**").authenticated()
                .requestMatchers("/api/xp/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/badges").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/badges/mine").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/badges/user/**").hasAnyRole("TEACHER", "MODERATOR")
                .requestMatchers(HttpMethod.POST, "/api/badges").hasAnyRole("TEACHER", "MODERATOR")
                .requestMatchers(HttpMethod.POST, "/api/badges/assign").hasAnyRole("TEACHER", "MODERATOR")
                .requestMatchers(HttpMethod.PUT, "/api/badges/**").hasAnyRole("TEACHER", "MODERATOR")
                .requestMatchers(HttpMethod.DELETE, "/api/badges/**").hasAnyRole("TEACHER", "MODERATOR")
                .requestMatchers("/api/admin/**").hasRole("MODERATOR")
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .successHandler(discordAuthSuccessHandler)
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
