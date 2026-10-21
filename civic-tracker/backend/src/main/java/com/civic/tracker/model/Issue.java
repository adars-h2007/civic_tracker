package com.civic.tracker.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "issues", indexes = {
        @Index(name = "idx_issue_status", columnList = "status"),
        @Index(name = "idx_issue_category", columnList = "category")
})
@Getter
@Setter
@NoArgsConstructor
public class Issue {

    public enum Category { ROADS, WATER, LIGHTING, GARBAGE, DRAINAGE, PARKS, OTHER }

    public enum Status { REPORTED, ACKNOWLEDGED, IN_PROGRESS, RESOLVED, REJECTED }

    public enum Priority { LOW, MEDIUM, HIGH, URGENT }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 120)
    @Column(nullable = false, length = 120)
    private String title;

    @Size(max = 1000)
    @Column(length = 1000)
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Category category;

    @NotBlank
    @Size(max = 160)
    @Column(nullable = false, length = 160)
    private String location;

    @NotBlank
    @Size(max = 80)
    @Column(nullable = false, length = 80)
    private String ward;

    @NotBlank
    @Size(max = 80)
    @Column(nullable = false, length = 80)
    private String reporterName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status = Status.REPORTED;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Priority priority = Priority.MEDIUM;

    @Column(nullable = false)
    private int upvotes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) createdAt = now;
        updatedAt = now;
        if (status == null) status = Status.REPORTED;
        if (priority == null) priority = Priority.MEDIUM;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
