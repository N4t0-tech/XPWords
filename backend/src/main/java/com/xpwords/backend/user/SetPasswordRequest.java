package com.xpwords.backend.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SetPasswordRequest {
    @NotBlank
    @Size(min = 6)
    private String newPassword;
}
