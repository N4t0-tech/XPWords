package com.xpwords.backend.quiz;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizWordRepository extends JpaRepository<QuizWord, Long> {
    List<QuizWord> findByQuizIdOrderById(Long quizId);
    void deleteByQuizId(Long quizId);
}
