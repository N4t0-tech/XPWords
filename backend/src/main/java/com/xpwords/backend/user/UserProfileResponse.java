package com.xpwords.backend.user;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserProfileResponse {
    private Long id;
    private String name;
    private String email;
    private String discordId;
    private String discordTag;
    private int level;
    private int xp;
    private String avatarBg;
    private String role;
}
