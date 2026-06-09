package com.xpwords.backend.xp;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface XpTransactionRepository extends JpaRepository<XpTransaction, Long> {
    List<XpTransaction> findByUserIdOrderByCreatedAtDesc(Long userId);
}
