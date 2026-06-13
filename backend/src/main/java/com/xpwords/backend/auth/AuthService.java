package com.xpwords.backend.auth;

import com.xpwords.backend.user.Role;
import com.xpwords.backend.user.User;
import com.xpwords.backend.user.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final TokenRepository tokenRepository;
    private final MailService mailService;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider,
                       TokenRepository tokenRepository,
                       MailService mailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.tokenRepository = tokenRepository;
        this.mailService = mailService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("El email ya está registrado");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        user.setRole(Role.STUDENT);

        user = userRepository.save(user);

        String token = jwtTokenProvider.generateToken(user.getId(), user.getRole().name(), request.isRememberMe());
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Email o contraseña incorrectos"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Email o contraseña incorrectos");
        }

        String token = jwtTokenProvider.generateToken(user.getId(), user.getRole().name(), request.isRememberMe());
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }

    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return;

        tokenRepository.findByUserIdAndUsedFalse(user.getId())
                .forEach(t -> { t.setUsed(true); tokenRepository.save(t); });

        String code = String.format("%06d", secureRandom.nextInt(1_000_000));
        PasswordResetToken token = new PasswordResetToken();
        token.setUserId(user.getId());
        token.setCode(code);
        token.setExpiresAt(LocalDateTime.now().plusMinutes(15));
        tokenRepository.save(token);

        mailService.sendResetCode(email, code);
    }

    public void resetPassword(String code, String newPassword) {
        PasswordResetToken token = tokenRepository.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Código inválido"));

        if (token.isUsed()) throw new IllegalArgumentException("Código ya utilizado");
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) throw new IllegalArgumentException("Código expirado");

        User user = userRepository.findById(token.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        token.setUsed(true);
        tokenRepository.save(token);
    }
}
