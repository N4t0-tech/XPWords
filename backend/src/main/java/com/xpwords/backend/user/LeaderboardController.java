package com.xpwords.backend.user;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@RestController
@RequestMapping("/api")
public class LeaderboardController {

    private final UserRepository userRepository;

    public LeaderboardController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<LeaderboardEntry>> getLeaderboard() {
        List<User> users = userRepository.findAll();
        users.sort((a, b) -> b.getXp() - a.getXp());

        AtomicInteger rank = new AtomicInteger(1);
        List<LeaderboardEntry> entries = new ArrayList<>();
        for (User u : users) {
            entries.add(new LeaderboardEntry(
                    rank.getAndIncrement(),
                    u.getName(),
                    u.getLevel(),
                    u.getXp(),
                    u.getAvatarBg()));
        }
        return ResponseEntity.ok(entries);
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        long userCount = userRepository.count();
        return ResponseEntity.ok(java.util.Map.of(
                "activeMembers", (int) userCount,
                "games", 4,
                "resources", 5));
    }
}
