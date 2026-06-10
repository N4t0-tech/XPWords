package com.xpwords.backend.user;

import com.xpwords.backend.common.ErrorResponse;
import org.springframework.http.ResponseEntity;
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
                        u.getRole().name()))
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

        try {
            user.setRole(Role.valueOf(newRole.toUpperCase()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Rol inválido"));
        }

        userRepository.save(user);
        return ResponseEntity.ok(new ErrorResponse("Rol actualizado"));
    }
}
