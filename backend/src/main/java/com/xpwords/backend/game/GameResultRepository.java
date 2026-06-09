package com.xpwords.backend.game;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GameResultRepository extends JpaRepository<GameResult, Long> {
    List<GameResult> findByUserIdOrderByCreatedAtDesc(Long userId);
}
