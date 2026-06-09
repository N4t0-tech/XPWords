CREATE TABLE users (
    id            BIGSERIAL    PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password      VARCHAR(255) NOT NULL,
    name          VARCHAR(100) NOT NULL,
    discord_id    VARCHAR(100),
    discord_tag   VARCHAR(100),
    level         INT          NOT NULL DEFAULT 1,
    xp            INT          NOT NULL DEFAULT 0,
    avatar_bg     VARCHAR(255),
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE words (
    id            BIGSERIAL    PRIMARY KEY,
    word          VARCHAR(100) NOT NULL,
    hint          VARCHAR(50)  NOT NULL,
    options       JSONB        NOT NULL,
    correct_index INT          NOT NULL
);

CREATE TABLE game_results (
    id            BIGSERIAL    PRIMARY KEY,
    user_id       BIGINT       NOT NULL REFERENCES users(id),
    game_type     VARCHAR(20)  NOT NULL,
    score         INT          NOT NULL,
    streak        INT          NOT NULL DEFAULT 0,
    round         INT          NOT NULL DEFAULT 1,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE resources (
    id            BIGSERIAL    PRIMARY KEY,
    title         VARCHAR(255) NOT NULL,
    category      VARCHAR(50)  NOT NULL,
    meta          VARCHAR(255),
    type          VARCHAR(20)  NOT NULL,
    btn           VARCHAR(50),
    url           VARCHAR(500)
);

CREATE TABLE badges (
    id            BIGSERIAL    PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    icon          VARCHAR(50)  NOT NULL,
    description   VARCHAR(255)
);

CREATE TABLE user_badges (
    user_id       BIGINT       NOT NULL REFERENCES users(id),
    badge_id      BIGINT       NOT NULL REFERENCES badges(id),
    earned_at     TIMESTAMP    NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, badge_id)
);

CREATE TABLE xp_transactions (
    id            BIGSERIAL    PRIMARY KEY,
    user_id       BIGINT       NOT NULL REFERENCES users(id),
    amount        INT          NOT NULL,
    source        VARCHAR(20)  NOT NULL,
    description   VARCHAR(255),
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_game_results_user ON game_results(user_id);
CREATE INDEX idx_xp_transactions_user ON xp_transactions(user_id);
CREATE INDEX idx_resources_category ON resources(category);
