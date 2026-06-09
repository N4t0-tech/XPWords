package com.xpwords.backend.resource;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "resources")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(length = 255)
    private String meta;

    @Column(nullable = false, length = 20)
    private String type;

    @Column(length = 50)
    private String btn;

    @Column(length = 500)
    private String url;
}
