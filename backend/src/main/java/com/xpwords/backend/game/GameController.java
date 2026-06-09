package com.xpwords.backend.game;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/games")
public class GameController {

    private final GameService gameService;
    private final GameResultRepository gameResultRepository;

    public GameController(GameService gameService, GameResultRepository gameResultRepository) {
        this.gameService = gameService;
        this.gameResultRepository = gameResultRepository;
    }

    @PostMapping("/score")
    public ResponseEntity<GameResult> submitScore(Authentication auth,
                                                   @Valid @RequestBody SubmitScoreRequest request) {
        Long userId = (Long) auth.getPrincipal();
        GameResult result = gameService.submitScore(userId, request);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/history")
    public ResponseEntity<List<GameResult>> getHistory(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(gameResultRepository.findByUserIdOrderByCreatedAtDesc(userId));
    }
}
