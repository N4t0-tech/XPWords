package com.xpwords.backend.quiz;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class QuizWordRequest {
    @NotBlank
    private String word;

    @NotBlank
    private String hint;

    @NotNull
    private String options;

    @NotNull
    private int correctIndex;
}
