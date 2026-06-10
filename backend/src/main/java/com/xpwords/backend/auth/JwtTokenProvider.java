package com.xpwords.backend.auth;

import com.xpwords.backend.config.JwtConfig;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private final SecretKey key;
    private final long expirationMs;

    public JwtTokenProvider(JwtConfig jwtConfig) {
        this.key = Keys.hmacShaKeyFor(java.util.Base64.getDecoder().decode(jwtConfig.getSecret()));
        this.expirationMs = jwtConfig.getExpirationMs();
    }

    public String generateToken(Long userId, String role) {
        return generateToken(userId, role, false);
    }

    public String generateToken(Long userId, String role, boolean rememberMe) {
        long expMs = rememberMe ? 30L * 24 * 60 * 60 * 1000 : expirationMs;
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expMs);

        return Jwts.builder()
                .subject(userId.toString())
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key)
                .compact();
    }

    public Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Long getUserIdFromToken(String token) {
        return Long.parseLong(getClaims(token).getSubject());
    }

    public String getRoleFromToken(String token) {
        return getClaims(token).get("role", String.class);
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
