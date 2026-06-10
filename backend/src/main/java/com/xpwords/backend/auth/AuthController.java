package com.xpwords.backend.auth;

import com.xpwords.backend.user.User;
import com.xpwords.backend.user.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final ConcurrentHashMap<String, List<Long>> loginAttempts = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, List<Long>> registerAttempts = new ConcurrentHashMap<>();
    private static final int LOGIN_MAX = 5;
    private static final int REGISTER_MAX = 3;
    private static final long WINDOW_MS = 60_000;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request, HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();
        if (isRateLimited(registerAttempts, ip, REGISTER_MAX)) {
            return ResponseEntity.status(429).build();
        }
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();
        if (isRateLimited(loginAttempts, ip, LOGIN_MAX)) {
            return ResponseEntity.status(429).build();
        }
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    private boolean isRateLimited(ConcurrentHashMap<String, List<Long>> store, String ip, int max) {
        long now = System.currentTimeMillis();
        store.compute(ip, (key, timestamps) -> {
            if (timestamps == null) {
                return new java.util.ArrayList<>(List.of(now));
            }
            timestamps.removeIf(t -> now - t > WINDOW_MS);
            timestamps.add(now);
            return timestamps;
        });
        List<Long> timestamps = store.get(ip);
        return timestamps != null && timestamps.size() > max;
    }

    @PostMapping("/discord")
    public ResponseEntity<Map<String, String>> disconnectDiscord(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            user.setDiscordId(null);
            user.setDiscordTag(null);
            userRepository.save(user);
        }
        return ResponseEntity.ok(Map.of("message", "Discord desconectado"));
    }
}
