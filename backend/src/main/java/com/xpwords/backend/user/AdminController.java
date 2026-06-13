package com.xpwords.backend.user;

import com.xpwords.backend.common.ErrorResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;

    public AdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserProfileResponse>> listUsers() {
        List<User> users = userRepository.findAll();
        List<UserProfileResponse> responses = users.stream()
                .map(u -> new UserProfileResponse(
                        u.getId(), u.getName(), u.getEmail(),
                        u.getDiscordId(), u.getDiscordTag(),
                        u.getDiscordAvatar(),
                        u.getLevel(), u.getXp(), u.getAvatarBg(),
                        u.getRole().name(), u.isActive()))
                .toList();
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<ErrorResponse> updateRole(@PathVariable Long id,
                                                     @RequestBody Map<String, String> body) {
        String newRole = body.get("role");
        if (newRole == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Rol inválido"));
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long currentUserId = Long.valueOf(auth.getName());
        if (currentUserId.equals(id)) {
            return ResponseEntity.status(403).body(new ErrorResponse("No puedes cambiar tu propio rol"));
        }

        boolean isTeacher = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_TEACHER"));

        if (isTeacher) {
            if (user.getRole() == Role.MODERATOR) {
                return ResponseEntity.status(403).body(new ErrorResponse("No puedes modificar un MODERATOR"));
            }
            if (newRole.equalsIgnoreCase("MODERATOR")) {
                return ResponseEntity.status(403).body(new ErrorResponse("No puedes asignar rol MODERATOR"));
            }
        }

        try {
            user.setRole(Role.valueOf(newRole.toUpperCase()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Rol inválido"));
        }

        userRepository.save(user);
        return ResponseEntity.ok(new ErrorResponse("Rol actualizado"));
    }

    @PutMapping("/users/{id}/toggle-active")
    public ResponseEntity<ErrorResponse> toggleActive(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long currentUserId = Long.valueOf(auth.getName());
        if (currentUserId.equals(id)) {
            return ResponseEntity.status(403).body(new ErrorResponse("No puedes desactivarte a ti mismo"));
        }

        user.setActive(!user.isActive());
        userRepository.save(user);
        String msg = user.isActive() ? "Usuario reactivado" : "Usuario desactivado";
        return ResponseEntity.ok(new ErrorResponse(msg));
    }
}
