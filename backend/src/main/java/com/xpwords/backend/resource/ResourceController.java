package com.xpwords.backend.resource;

import com.xpwords.backend.common.ErrorResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    private final ResourceRepository resourceRepository;

    public ResourceController(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    @GetMapping
    public ResponseEntity<List<Resource>> getResources(@RequestParam(required = false) String category) {
        if (category != null && !category.isEmpty() && !category.equals("Todos")) {
            return ResponseEntity.ok(resourceRepository.findByCategory(category));
        }
        return ResponseEntity.ok(resourceRepository.findAll());
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(List.of("Todos", "Gramática", "Vocabulario", "Listening", "Writing"));
    }

    @PostMapping
    public ResponseEntity<Resource> createResource(@Valid @RequestBody CreateResourceRequest request) {
        Resource resource = new Resource();
        resource.setTitle(request.getTitle());
        resource.setCategory(request.getCategory());
        resource.setMeta(request.getMeta());
        resource.setType(request.getType());
        resource.setBtn(request.getBtn());
        resource.setUrl(request.getUrl());
        resource = resourceRepository.save(resource);
        return ResponseEntity.ok(resource);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Resource> updateResource(@PathVariable Long id,
                                                    @Valid @RequestBody CreateResourceRequest request) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Recurso no encontrado"));
        resource.setTitle(request.getTitle());
        resource.setCategory(request.getCategory());
        resource.setMeta(request.getMeta());
        resource.setType(request.getType());
        resource.setBtn(request.getBtn());
        resource.setUrl(request.getUrl());
        resource = resourceRepository.save(resource);
        return ResponseEntity.ok(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ErrorResponse> deleteResource(@PathVariable Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Recurso no encontrado"));
        resourceRepository.delete(resource);
        return ResponseEntity.ok(new ErrorResponse("Recurso eliminado"));
    }
}
