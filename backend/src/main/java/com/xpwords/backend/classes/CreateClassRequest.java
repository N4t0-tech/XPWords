package com.xpwords.backend.classes;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateClassRequest {
    @NotBlank
    private String title;

    private String description;

    @NotNull
    private LocalDateTime date;
}
