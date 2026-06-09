package com.xpwords.backend.xp;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/xp")
public class XpController {

    private final XpTransactionRepository xpTransactionRepository;

    public XpController(XpTransactionRepository xpTransactionRepository) {
        this.xpTransactionRepository = xpTransactionRepository;
    }

    @GetMapping("/history")
    public ResponseEntity<List<XpTransaction>> getHistory(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(xpTransactionRepository.findByUserIdOrderByCreatedAtDesc(userId));
    }
}
