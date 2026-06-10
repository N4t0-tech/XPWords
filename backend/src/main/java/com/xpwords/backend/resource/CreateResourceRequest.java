package com.xpwords.backend.resource;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateResourceRequest {
    @NotBlank
    private String title;

    @NotBlank
    private String category;

    private String meta;

    @NotBlank
    private String type;

    private String btn;

    private String url;
}
