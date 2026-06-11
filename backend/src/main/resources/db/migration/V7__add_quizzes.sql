CREATE TABLE quizzes (
    id          BIGSERIAL    PRIMARY KEY,
    title       VARCHAR(200) NOT NULL,
    description TEXT,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE quiz_words (
    id            BIGSERIAL    PRIMARY KEY,
    quiz_id       BIGINT       NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    word          VARCHAR(100) NOT NULL,
    hint          VARCHAR(50)  NOT NULL,
    options       TEXT         NOT NULL,
    correct_index INT          NOT NULL
);

CREATE INDEX idx_quiz_words_quiz ON quiz_words(quiz_id);
