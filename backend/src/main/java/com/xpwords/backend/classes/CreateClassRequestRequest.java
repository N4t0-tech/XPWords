package com.xpwords.backend.classes;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateClassRequestRequest {
    @NotNull
    private Long teacherId;

    @NotBlank
    private String topic;

    private String message;

    private LocalDateTime requestedDate;
}
