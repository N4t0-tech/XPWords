package com.xpwords.backend.classes;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ClassRequestResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long teacherId;
    private String teacherName;
    private String topic;
    private String message;
    private String status;
    private LocalDateTime requestedDate;
    private LocalDateTime createdAt;
}
