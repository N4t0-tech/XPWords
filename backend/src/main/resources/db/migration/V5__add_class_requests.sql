CREATE TABLE class_requests (
    id             BIGSERIAL    PRIMARY KEY,
    student_id     BIGINT       NOT NULL REFERENCES users(id),
    teacher_id     BIGINT       NOT NULL REFERENCES users(id),
    topic          VARCHAR(255) NOT NULL,
    message        TEXT,
    status         VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    requested_date TIMESTAMP,
    created_at     TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_class_requests_student ON class_requests(student_id);
CREATE INDEX idx_class_requests_teacher ON class_requests(teacher_id);
CREATE INDEX idx_class_requests_status ON class_requests(status);
