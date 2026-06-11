package com.xpwords.backend.badge;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BadgeRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String icon;

    private String description;
}
