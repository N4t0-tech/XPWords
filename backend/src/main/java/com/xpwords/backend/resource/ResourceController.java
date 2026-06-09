package com.xpwords.backend.resource;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
