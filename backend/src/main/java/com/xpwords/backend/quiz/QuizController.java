package com.xpwords.backend.quiz;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    private final QuizRepository quizRepository;
    private final QuizWordRepository quizWordRepository;

    public QuizController(QuizRepository quizRepository, QuizWordRepository quizWordRepository) {
        this.quizRepository = quizRepository;
        this.quizWordRepository = quizWordRepository;
    }

    @GetMapping
    public ResponseEntity<List<Quiz>> getAllQuizzes() {
        return ResponseEntity.ok(quizRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Quiz> createQuiz(@Valid @RequestBody QuizRequest request) {
        Quiz quiz = new Quiz();
        quiz.setTitle(request.getTitle());
        quiz.setDescription(request.getDescription());
        return ResponseEntity.status(HttpStatus.CREATED).body(quizRepository.save(quiz));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Quiz> updateQuiz(@PathVariable Long id, @Valid @RequestBody QuizRequest request) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Minijuego no encontrado"));
        quiz.setTitle(request.getTitle());
        quiz.setDescription(request.getDescription());
        return ResponseEntity.ok(quizRepository.save(quiz));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long id) {
        quizWordRepository.deleteByQuizId(id);
        quizRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{quizId}/words")
    public ResponseEntity<List<QuizWord>> getWords(@PathVariable Long quizId) {
        return ResponseEntity.ok(quizWordRepository.findByQuizIdOrderById(quizId));
    }

    @PostMapping("/{quizId}/words")
    public ResponseEntity<QuizWord> createWord(@PathVariable Long quizId, @Valid @RequestBody QuizWordRequest request) {
        if (!quizRepository.existsById(quizId)) {
            return ResponseEntity.notFound().build();
        }
        QuizWord word = new QuizWord();
        word.setQuizId(quizId);
        word.setWord(request.getWord());
        word.setHint(request.getHint());
        word.setOptions(request.getOptions());
        word.setCorrectIndex(request.getCorrectIndex());
        return ResponseEntity.status(HttpStatus.CREATED).body(quizWordRepository.save(word));
    }

    @PutMapping("/{quizId}/words/{wordId}")
    public ResponseEntity<QuizWord> updateWord(@PathVariable Long quizId, @PathVariable Long wordId,
                                                @Valid @RequestBody QuizWordRequest request) {
        QuizWord word = quizWordRepository.findById(wordId)
                .orElseThrow(() -> new IllegalArgumentException("Palabra no encontrada"));
        word.setWord(request.getWord());
        word.setHint(request.getHint());
        word.setOptions(request.getOptions());
        word.setCorrectIndex(request.getCorrectIndex());
        return ResponseEntity.ok(quizWordRepository.save(word));
    }

    @DeleteMapping("/{quizId}/words/{wordId}")
    public ResponseEntity<Void> deleteWord(@PathVariable Long quizId, @PathVariable Long wordId) {
        quizWordRepository.deleteById(wordId);
        return ResponseEntity.noContent().build();
    }
}
