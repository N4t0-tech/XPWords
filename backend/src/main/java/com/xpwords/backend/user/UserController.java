package com.xpwords.backend.user;

import com.xpwords.backend.common.ErrorResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users/me")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public ResponseEntity<UserProfileResponse> getProfile(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        return ResponseEntity.ok(new UserProfileResponse(
                user.getId(), user.getName(), user.getEmail(),
                user.getDiscordId(), user.getDiscordTag(),
                user.getLevel(), user.getXp(), user.getAvatarBg()));
    }

    @PutMapping
    public ResponseEntity<UserProfileResponse> updateProfile(Authentication auth,
                                                              @Valid @RequestBody UpdateProfileRequest request) {
        Long userId = (Long) auth.getPrincipal();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        if (!user.getEmail().equals(request.getEmail()) &&
                userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(null);
        }

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user = userRepository.save(user);

        return ResponseEntity.ok(new UserProfileResponse(
                user.getId(), user.getName(), user.getEmail(),
                user.getDiscordId(), user.getDiscordTag(),
                user.getLevel(), user.getXp(), user.getAvatarBg()));
    }

    @PutMapping("/password")
    public ResponseEntity<ErrorResponse> changePassword(Authentication auth,
                                                         @Valid @RequestBody ChangePasswordRequest request) {
        Long userId = (Long) auth.getPrincipal();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Contraseña actual incorrecta"));
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(new ErrorResponse("Contraseña actualizada"));
    }

    @DeleteMapping
    public ResponseEntity<ErrorResponse> deleteAccount(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        userRepository.deleteById(userId);
        return ResponseEntity.ok(new ErrorResponse("Cuenta eliminada"));
    }
}
