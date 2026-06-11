package com.xpwords.backend.word;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "words")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Word {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String word;

    @Column(nullable = false, length = 50)
    private String hint;

    @Column(columnDefinition = "JSONB", nullable = false)
    private String options;

    @Column(name = "correct_index", nullable = false)
    private int correctIndex;

    @Column(name = "game_type", nullable = false, length = 20)
    private String gameType = "wordsnap";
}
