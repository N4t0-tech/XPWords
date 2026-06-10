package com.xpwords.backend.classes;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClassRepository extends JpaRepository<Class, Long> {
    List<Class> findByTeacherIdOrderByDateAsc(Long teacherId);
}
