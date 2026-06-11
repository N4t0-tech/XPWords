package com.xpwords.backend.quiz;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class QuizRequest {
    @NotBlank
    private String title;

    private String description;
}
