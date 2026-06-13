package com.xpwords.backend.user;

import com.xpwords.backend.common.ErrorResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getProfile(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        return ResponseEntity.ok(new UserProfileResponse(
                user.getId(), user.getName(), user.getEmail(),
                user.getDiscordId(), user.getDiscordTag(),
                user.getDiscordAvatar(),
                user.getLevel(), user.getXp(), user.getAvatarBg(),
                user.getRole().name(), user.isActive()));
    }

    @GetMapping("/students")
    public ResponseEntity<List<UserProfileResponse>> getStudents() {
        List<User> students = userRepository.findByRoleAndActiveTrue(Role.STUDENT);
        List<UserProfileResponse> responses = students.stream()
                .map(u -> new UserProfileResponse(
                        u.getId(), u.getName(), u.getEmail(),
                        u.getDiscordId(), u.getDiscordTag(),
                        u.getDiscordAvatar(),
                        u.getLevel(), u.getXp(), u.getAvatarBg(),
                        u.getRole().name(), u.isActive()))
                .toList();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/teachers")
    public ResponseEntity<List<UserProfileResponse>> getTeachers() {
        List<User> teachers = userRepository.findByRoleAndActiveTrue(Role.TEACHER);
        List<UserProfileResponse> responses = teachers.stream()
                .map(u -> new UserProfileResponse(
                        u.getId(), u.getName(), u.getEmail(),
                        u.getDiscordId(), u.getDiscordTag(),
                        u.getDiscordAvatar(),
                        u.getLevel(), u.getXp(), u.getAvatarBg(),
                        u.getRole().name(), u.isActive()))
                .toList();
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(Authentication auth,
                                                              @Valid @RequestBody UpdateProfileRequest request) {
        Long userId = (Long) auth.getPrincipal();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        if (!user.getEmail().equals(request.getEmail()) &&
                userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("El email ya está registrado por otro usuario"));
        }

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user = userRepository.save(user);

        return ResponseEntity.ok(new UserProfileResponse(
                user.getId(), user.getName(), user.getEmail(),
                user.getDiscordId(), user.getDiscordTag(),
                user.getDiscordAvatar(),
                user.getLevel(), user.getXp(), user.getAvatarBg(),
                user.getRole().name(), user.isActive()));
    }

    @PutMapping("/me/set-password")
    public ResponseEntity<ErrorResponse> setPassword(Authentication auth,
                                                      @Valid @RequestBody SetPasswordRequest request) {
        Long userId = (Long) auth.getPrincipal();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        if (user.getDiscordId() == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Ya tienes una contraseña establecida"));
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(new ErrorResponse("Contraseña establecida"));
    }

    @PutMapping("/me/password")
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

    @DeleteMapping("/me")
    public ResponseEntity<ErrorResponse> deleteAccount(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        user.setActive(false);
        userRepository.save(user);
        return ResponseEntity.ok(new ErrorResponse("Cuenta desactivada"));
    }
}
