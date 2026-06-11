package com.xpwords.backend.word;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WordRequest {
    @NotBlank
    private String word;

    @NotBlank
    private String hint;

    @NotNull
    private String options;

    @NotNull
    private int correctIndex;

    @NotBlank
    private String gameType;
}
