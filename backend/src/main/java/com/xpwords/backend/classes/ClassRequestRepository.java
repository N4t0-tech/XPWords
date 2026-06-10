package com.xpwords.backend.classes;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClassRequestRepository extends JpaRepository<ClassRequest, Long> {
    List<ClassRequest> findByTeacherIdOrderByCreatedAtDesc(Long teacherId);
    List<ClassRequest> findByStudentIdOrderByCreatedAtDesc(Long studentId);
}
