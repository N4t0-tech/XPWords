package com.xpwords.backend.auth;

import com.xpwords.backend.user.User;
import com.xpwords.backend.user.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@RestController
public class DiscordLinkController {

    private final UserRepository userRepository;
    private final RestTemplate restTemplate;

    @Value("${spring.security.oauth2.client.registration.discord.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.discord.client-secret}")
    private String clientSecret;

    private final Map<String, Long> linkStates = new ConcurrentHashMap<>();
    private static final String DISCORD_TOKEN_URL = "https://discord.com/api/oauth2/token";
    private static final String DISCORD_USER_URL = "https://discord.com/api/users/@me";

    public DiscordLinkController(UserRepository userRepository, RestTemplate restTemplate) {
        this.userRepository = userRepository;
        this.restTemplate = restTemplate;
    }

    @GetMapping("/api/users/me/discord/link")
    public ResponseEntity<Map<String, String>> linkDiscord(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        String nonce = UUID.randomUUID().toString();
        linkStates.put(nonce, userId);

        String redirectUri = "http://localhost:3001/api/auth/discord/callback";
        String state = "link_" + nonce;
        String authorizeUrl = "https://discord.com/api/oauth2/authorize" +
                "?client_id=" + clientId +
                "&redirect_uri=" + URLEncoder.encode(redirectUri, StandardCharsets.UTF_8) +
                "&response_type=code" +
                "&scope=identify%20email" +
                "&state=" + state;

        Map<String, String> body = new HashMap<>();
        body.put("url", authorizeUrl);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/api/auth/discord/callback")
    public void discordCallback(@RequestParam String code,
                                 @RequestParam String state,
                                 HttpServletResponse response) throws IOException {
        String frontendUrl = "http://localhost:5173/profile";

        if (!state.startsWith("link_")) {
            response.sendRedirect(frontendUrl + "?discord=error");
            return;
        }

        String nonce = state.substring(5);
        Long userId = linkStates.remove(nonce);
        if (userId == null) {
            response.sendRedirect(frontendUrl + "?discord=error");
            return;
        }

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            response.sendRedirect(frontendUrl + "?discord=error");
            return;
        }

        try {
            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("client_id", clientId);
            body.add("client_secret", clientSecret);
            body.add("grant_type", "authorization_code");
            body.add("code", code);
            body.add("redirect_uri", "http://localhost:3001/api/auth/discord/callback");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            HttpEntity<MultiValueMap<String, String>> tokenRequest = new HttpEntity<>(body, headers);
            ResponseEntity<Map> tokenResponse = restTemplate.exchange(
                    DISCORD_TOKEN_URL, HttpMethod.POST, tokenRequest, Map.class);

            String accessToken = (String) tokenResponse.getBody().get("access_token");

            HttpHeaders userHeaders = new HttpHeaders();
            userHeaders.setBearerAuth(accessToken);
            HttpEntity<Void> userRequest = new HttpEntity<>(userHeaders);
            ResponseEntity<Map> userResponse = restTemplate.exchange(
                    DISCORD_USER_URL, HttpMethod.GET, userRequest, Map.class);

            Map<String, Object> discordUser = userResponse.getBody();
            String discordId = String.valueOf(discordUser.get("id"));
            String discriminator = String.valueOf(discordUser.get("discriminator"));
            String discordTag = "0".equals(discriminator)
                    ? String.valueOf(discordUser.get("username"))
                    : discordUser.get("username") + "#" + discriminator;

            String existingDiscordId = user.getDiscordId();
            user.setDiscordId(discordId);
            user.setDiscordTag(discordTag);
            userRepository.save(user);

            if (existingDiscordId != null) {
                response.sendRedirect(frontendUrl + "?discord=updated");
            } else {
                response.sendRedirect(frontendUrl + "?discord=linked");
            }
        } catch (Exception e) {
            response.sendRedirect(frontendUrl + "?discord=error");
        }
    }
}
