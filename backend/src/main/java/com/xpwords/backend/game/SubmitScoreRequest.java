package com.xpwords.backend.game;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class SubmitScoreRequest {
    @NotBlank
    private String gameType;

    @PositiveOrZero
    private int score;

    @PositiveOrZero
    private int streak;

    private int round = 1;
}
