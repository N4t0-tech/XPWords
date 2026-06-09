package com.xpwords.backend.badge;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserBadgeRepository extends JpaRepository<UserBadge, UserBadge.UserBadgeId> {
    List<UserBadge> findByIdUserId(Long userId);
}
