package com.xpwords.backend.classes;

import com.xpwords.backend.common.ErrorResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/classes")
public class ClassController {

    private final ClassRepository classRepository;

    public ClassController(ClassRepository classRepository) {
        this.classRepository = classRepository;
    }

    @GetMapping
    public ResponseEntity<List<Class>> getMyClasses(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(classRepository.findByTeacherIdOrderByDateAsc(userId));
    }

    @PostMapping
    public ResponseEntity<Class> createClass(Authentication auth, @Valid @RequestBody CreateClassRequest request) {
        Long userId = (Long) auth.getPrincipal();
        Class cls = new Class();
        cls.setTitle(request.getTitle());
        cls.setDescription(request.getDescription());
        cls.setDate(request.getDate());
        cls.setTeacherId(userId);
        cls = classRepository.save(cls);
        return ResponseEntity.ok(cls);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ErrorResponse> deleteClass(Authentication auth, @PathVariable Long id) {
        Long userId = (Long) auth.getPrincipal();
        Class cls = classRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Clase no encontrada"));
        if (!cls.getTeacherId().equals(userId)) {
            return ResponseEntity.status(403).body(new ErrorResponse("No tienes permiso para eliminar esta clase"));
        }
        classRepository.delete(cls);
        return ResponseEntity.ok(new ErrorResponse("Clase eliminada"));
    }
}
