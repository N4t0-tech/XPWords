package com.xpwords.backend.word;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/words")
public class WordController {

    private final WordRepository wordRepository;

    public WordController(WordRepository wordRepository) {
        this.wordRepository = wordRepository;
    }

    @GetMapping
    public ResponseEntity<List<Word>> getWords() {
        return ResponseEntity.ok(wordRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Word> createWord(@Valid @RequestBody WordRequest request) {
        Word word = new Word();
        word.setWord(request.getWord());
        word.setHint(request.getHint());
        word.setOptions(request.getOptions());
        word.setCorrectIndex(request.getCorrectIndex());
        return ResponseEntity.status(HttpStatus.CREATED).body(wordRepository.save(word));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Word> updateWord(@PathVariable Long id, @Valid @RequestBody WordRequest request) {
        Word word = wordRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Palabra no encontrada"));
        word.setWord(request.getWord());
        word.setHint(request.getHint());
        word.setOptions(request.getOptions());
        word.setCorrectIndex(request.getCorrectIndex());
        return ResponseEntity.ok(wordRepository.save(word));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWord(@PathVariable Long id) {
        wordRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
