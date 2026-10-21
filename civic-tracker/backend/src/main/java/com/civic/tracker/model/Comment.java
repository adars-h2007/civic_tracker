package com.civic.tracker.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** One entry in an issue's timeline: either a public comment or a status change. */
@Entity
@Table(name = "issue_comments", indexes = @Index(name = "idx_comment_issue", columnList = "issue_id"))
@Getter
@Setter
@NoArgsConstructor
public class Comment {

    public enum Kind { COMMENT, STATUS }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "issue_id", nullable = false)
    private Long issueId;

    @Column(nullable = false, length = 80)
    private String author;

    @Column(nullable = false, length = 500)
    private String text;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Kind kind = Kind.COMMENT;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (kind == null) kind = Kind.COMMENT;
    }
}
