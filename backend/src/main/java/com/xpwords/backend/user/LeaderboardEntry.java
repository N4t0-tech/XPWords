package com.xpwords.backend.user;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LeaderboardEntry {
    private int rank;
    private String name;
    private int level;
    private int xp;
    private String avatarBg;
}
