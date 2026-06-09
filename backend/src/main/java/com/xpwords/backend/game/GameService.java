package com.xpwords.backend.game;

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

    public GameService(GameResultRepository gameResultRepository,
                       UserRepository userRepository,
                       XpTransactionRepository xpTransactionRepository) {
        this.gameResultRepository = gameResultRepository;
        this.userRepository = userRepository;
        this.xpTransactionRepository = xpTransactionRepository;
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
        userRepository.save(user);

        XpTransaction tx = new XpTransaction();
        tx.setUser(user);
        tx.setAmount(request.getScore());
        tx.setSource("GAME");
        tx.setDescription(request.getGameType() + " — " + request.getScore() + " XP");
        xpTransactionRepository.save(tx);

        return result;
    }
}
