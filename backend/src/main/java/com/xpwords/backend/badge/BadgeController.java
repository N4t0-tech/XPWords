package com.xpwords.backend.badge;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/badges")
public class BadgeController {

    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;

    public BadgeController(BadgeRepository badgeRepository, UserBadgeRepository userBadgeRepository) {
        this.badgeRepository = badgeRepository;
        this.userBadgeRepository = userBadgeRepository;
    }

    @GetMapping
    public ResponseEntity<List<Badge>> getAllBadges() {
        return ResponseEntity.ok(badgeRepository.findAll());
    }

    @GetMapping("/mine")
    public ResponseEntity<List<Badge>> getMyBadges(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        List<Long> earnedIds = userBadgeRepository.findByIdUserId(userId)
                .stream()
                .map(ub -> ub.getId().getBadgeId())
                .collect(Collectors.toList());
        return ResponseEntity.ok(badgeRepository.findAllById(earnedIds));
    }

    @PostMapping
    public ResponseEntity<Badge> createBadge(@Valid @RequestBody BadgeRequest request) {
        Badge badge = new Badge();
        badge.setName(request.getName());
        badge.setIcon(request.getIcon());
        badge.setDescription(request.getDescription());
        return ResponseEntity.status(HttpStatus.CREATED).body(badgeRepository.save(badge));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Badge> updateBadge(@PathVariable Long id, @Valid @RequestBody BadgeRequest request) {
        Badge badge = badgeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Medalla no encontrada"));
        badge.setName(request.getName());
        badge.setIcon(request.getIcon());
        badge.setDescription(request.getDescription());
        return ResponseEntity.ok(badgeRepository.save(badge));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBadge(@PathVariable Long id) {
        badgeRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
