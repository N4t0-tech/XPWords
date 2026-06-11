package com.xpwords.backend.quiz;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "quiz_words")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizWord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "quiz_id", nullable = false)
    private Long quizId;

    @Column(nullable = false, length = 100)
    private String word;

    @Column(nullable = false, length = 50)
    private String hint;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String options;

    @Column(name = "correct_index", nullable = false)
    private int correctIndex;
}
