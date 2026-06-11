package com.xpwords.backend.badge;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class BadgeService {

    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;

    public BadgeService(BadgeRepository badgeRepository, UserBadgeRepository userBadgeRepository) {
        this.badgeRepository = badgeRepository;
        this.userBadgeRepository = userBadgeRepository;
    }

    @Transactional
    public boolean assignBadgeIfNotOwned(Long userId, String badgeName) {
        Optional<Badge> badgeOpt = badgeRepository.findByName(badgeName);
        if (badgeOpt.isEmpty()) return false;

        Long badgeId = badgeOpt.get().getId();
        if (userBadgeRepository.existsByIdUserIdAndIdBadgeId(userId, badgeId)) return false;

        UserBadge ub = new UserBadge();
        ub.setId(new UserBadge.UserBadgeId(userId, badgeId));
        userBadgeRepository.save(ub);
        return true;
    }
}
