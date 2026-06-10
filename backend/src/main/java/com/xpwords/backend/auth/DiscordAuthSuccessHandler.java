package com.xpwords.backend.auth;

import com.xpwords.backend.user.Role;
import com.xpwords.backend.user.User;
import com.xpwords.backend.user.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;

@Component
public class DiscordAuthSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final String frontendUrl;

    public DiscordAuthSuccessHandler(UserRepository userRepository,
                                      JwtTokenProvider jwtTokenProvider,
                                      PasswordEncoder passwordEncoder,
                                      @Value("${app.frontend-url}") String frontendUrl) {
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = passwordEncoder;
        this.frontendUrl = frontendUrl;
    }

    private String generateRandomPassword() {
        return passwordEncoder.encode(UUID.randomUUID().toString());
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2AuthenticationToken oauth = (OAuth2AuthenticationToken) authentication;
        Map<String, Object> attrs = oauth.getPrincipal().getAttributes();

        String discordId = String.valueOf(attrs.get("id"));
        String discriminator = (String) attrs.get("discriminator");
        String discordTag = "0".equals(discriminator)
                ? (String) attrs.get("username")
                : attrs.get("username") + "#" + discriminator;
        String email = (String) attrs.get("email");
        String globalName = (String) attrs.get("global_name");
        if (globalName == null) globalName = (String) attrs.get("username");

        Optional<User> existing = userRepository.findByDiscordId(discordId);
        User user;

        if (existing.isPresent()) {
            user = existing.get();
            user.setDiscordTag(discordTag);
            userRepository.save(user);
        } else if (email != null) {
            Optional<User> byEmail = userRepository.findByEmail(email);
            if (byEmail.isPresent()) {
                user = byEmail.get();
                user.setDiscordId(discordId);
                user.setDiscordTag(discordTag);
                userRepository.save(user);
            } else {
                user = new User();
                user.setEmail(email != null ? email : discordId + "@discord.local");
                user.setName(globalName);
                user.setDiscordId(discordId);
                user.setDiscordTag(discordTag);
                user.setPassword(generateRandomPassword());
                user.setRole(Role.STUDENT);
                user = userRepository.save(user);
            }
        } else {
            user = new User();
            user.setEmail(discordId + "@discord.local");
            user.setName(globalName);
            user.setDiscordId(discordId);
            user.setDiscordTag(discordTag);
            user.setPassword(generateRandomPassword());
            user.setRole(Role.STUDENT);
            user = userRepository.save(user);
        }

        String token = jwtTokenProvider.generateToken(user.getId(), user.getRole().name());
        response.sendRedirect(frontendUrl + "/auth/callback?token=" + token);
    }
}
