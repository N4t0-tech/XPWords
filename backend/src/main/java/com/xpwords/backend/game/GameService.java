package com.xpwords.backend.game;

import com.xpwords.backend.badge.BadgeService;
import com.xpwords.backend.user.User;
import com.xpwords.backend.user.UserRepository;
import com.xpwords.backend.xp.XpTransaction;
import com.xpwords.backend.xp.XpTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GameService {

    private final GameResultRepository gameResultRepository;
    private final UserRepository userRepository;
    private final XpTransactionRepository xpTransactionRepository;
    private final BadgeService badgeService;

    public GameService(GameResultRepository gameResultRepository,
                       UserRepository userRepository,
                       XpTransactionRepository xpTransactionRepository,
                       BadgeService badgeService) {
        this.gameResultRepository = gameResultRepository;
        this.userRepository = userRepository;
        this.xpTransactionRepository = xpTransactionRepository;
        this.badgeService = badgeService;
    }

    @Transactional
    public GameResult submitScore(Long userId, SubmitScoreRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        GameResult result = new GameResult();
        result.setUser(user);
        result.setGameType(request.getGameType());
        result.setScore(request.getScore());
        result.setStreak(request.getStreak());
        result.setRound(request.getRound());
        result = gameResultRepository.save(result);

        user.setXp(user.getXp() + request.getScore());
        user.setLevel(user.getXp() / 100 + 1);
        userRepository.save(user);

        XpTransaction tx = new XpTransaction();
        tx.setUser(user);
        tx.setAmount(request.getScore());
        tx.setSource("GAME");
        tx.setDescription(request.getGameType() + " — " + request.getScore() + " XP");
        xpTransactionRepository.save(tx);

        boolean isFirstGame = gameResultRepository.countByUserId(userId) == 1;
        if (isFirstGame) {
            badgeService.assignBadgeIfNotOwned(userId, "Primer juego");
        }

        int newLevel = user.getLevel();
        if (newLevel >= 10) {
            badgeService.assignBadgeIfNotOwned(userId, "Nivel 10");
        }

        return result;
    }
}
