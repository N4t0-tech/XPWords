package com.xpwords.backend.classes;

import com.xpwords.backend.common.ErrorResponse;
import com.xpwords.backend.user.User;
import com.xpwords.backend.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/class-requests")
public class ClassRequestController {

    private final ClassRequestRepository classRequestRepository;
    private final UserRepository userRepository;

    public ClassRequestController(ClassRequestRepository classRequestRepository,
                                   UserRepository userRepository) {
        this.classRequestRepository = classRequestRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<ClassRequestResponse>> getMyRequests(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        String role = auth.getAuthorities().stream()
                .findFirst().map(a -> a.getAuthority().replace("ROLE_", ""))
                .orElse("STUDENT");

        List<ClassRequest> requests;
        if ("STUDENT".equals(role)) {
            requests = classRequestRepository.findByStudentIdOrderByCreatedAtDesc(userId);
        } else {
            requests = classRequestRepository.findByTeacherIdOrderByCreatedAtDesc(userId);
        }

        List<ClassRequestResponse> responses = requests.stream()
                .map(r -> {
                    String studentName = userRepository.findById(r.getStudentId())
                            .map(User::getName).orElse("Desconocido");
                    String teacherName = userRepository.findById(r.getTeacherId())
                            .map(User::getName).orElse("Desconocido");
                    return new ClassRequestResponse(
                            r.getId(), r.getStudentId(), studentName,
                            r.getTeacherId(), teacherName,
                            r.getTopic(), r.getMessage(), r.getStatus(),
                            r.getRequestedDate(), r.getCreatedAt());
                })
                .toList();
        return ResponseEntity.ok(responses);
    }

    @PostMapping
    public ResponseEntity<ClassRequest> createRequest(Authentication auth,
                                                       @Valid @RequestBody CreateClassRequestRequest request) {
        Long userId = (Long) auth.getPrincipal();
        ClassRequest cr = new ClassRequest();
        cr.setStudentId(userId);
        cr.setTeacherId(request.getTeacherId());
        cr.setTopic(request.getTopic());
        cr.setMessage(request.getMessage());
        cr.setRequestedDate(request.getRequestedDate());
        cr.setStatus("PENDING");
        cr = classRequestRepository.save(cr);
        return ResponseEntity.ok(cr);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ErrorResponse> updateStatus(Authentication auth,
                                                       @PathVariable Long id,
                                                       @RequestBody Map<String, String> body) {
        Long userId = (Long) auth.getPrincipal();
        ClassRequest request = classRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Solicitud no encontrada"));

        if (!request.getTeacherId().equals(userId)) {
            return ResponseEntity.status(403).body(new ErrorResponse("No tienes permiso para modificar esta solicitud"));
        }

        String status = body.get("status");
        if (!"APPROVED".equals(status) && !"REJECTED".equals(status)) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Estado inválido"));
        }

        request.setStatus(status);
        classRequestRepository.save(request);
        return ResponseEntity.ok(new ErrorResponse("Solicitud " + (status.equals("APPROVED") ? "aprobada" : "rechazada")));
    }
}
