package com.civic.tracker.config;

import com.civic.tracker.model.Comment;
import com.civic.tracker.model.Issue;
import com.civic.tracker.model.Issue.Category;
import com.civic.tracker.model.Issue.Priority;
import com.civic.tracker.model.Issue.Status;
import com.civic.tracker.repository.CommentRepository;
import com.civic.tracker.repository.IssueRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;

/** Demo issues and timelines on the first run only, so the app isn't empty. */
@Configuration
public class SeedData {

    @Bean
    CommandLineRunner seed(IssueRepository issues, CommentRepository comments) {
        return args -> {
            if (issues.count() > 0) return;

            Issue a = issues.save(issue("Deep pothole near the bus stand",
                    "About two feet wide. Two-wheelers are swerving into traffic at night.",
                    Category.ROADS, "MG Road, near City Bus Stand", "Ward 4 · Market",
                    "Priya S.", Status.IN_PROGRESS, Priority.HIGH, 18, 9));
            note(comments, a.getId(), Comment.Kind.STATUS, "Priya S.", "Issue reported.", 9);
            note(comments, a.getId(), Comment.Kind.STATUS, "Council team", "Status changed to Acknowledged.", 8);
            note(comments, a.getId(), Comment.Kind.STATUS, "Council team",
                    "Status changed to In progress: repair crew scheduled for Thursday.", 3);

            Issue b = issues.save(issue("Street light out for a week",
                    "Whole stretch of Lane 3 is dark after 7 PM.",
                    Category.LIGHTING, "Lane 3, Shanti Nagar", "Ward 2 · Shanti Nagar",
                    "Arun K.", Status.ACKNOWLEDGED, Priority.MEDIUM, 7, 5));
            note(comments, b.getId(), Comment.Kind.STATUS, "Arun K.", "Issue reported.", 5);
            note(comments, b.getId(), Comment.Kind.STATUS, "Council team", "Status changed to Acknowledged.", 4);

            Issue c = issues.save(issue("Overflowing garbage bin",
                    "Bin at the park gate has been full since the weekend.",
                    Category.GARBAGE, "Park gate, Green Colony", "Ward 7 · Green Colony",
                    "Meera D.", Status.REPORTED, Priority.MEDIUM, 11, 2));
            note(comments, c.getId(), Comment.Kind.STATUS, "Meera D.", "Issue reported.", 2);
            note(comments, c.getId(), Comment.Kind.COMMENT, "Neighbour",
                    "Still overflowing this morning. Smells bad near the play area.", 1);

            Issue d = issues.save(issue("Low water pressure every morning",
                    "Taps run almost dry between 6 and 8 AM.",
                    Category.WATER, "Block C, Sector 12", "Ward 1 · Old Town",
                    "Rahul V.", Status.RESOLVED, Priority.MEDIUM, 25, 20));
            note(comments, d.getId(), Comment.Kind.STATUS, "Rahul V.", "Issue reported.", 20);
            note(comments, d.getId(), Comment.Kind.STATUS, "Council team", "Status changed to Acknowledged.", 18);
            note(comments, d.getId(), Comment.Kind.STATUS, "Council team",
                    "Status changed to In progress: faulty valve identified.", 12);
            note(comments, d.getId(), Comment.Kind.STATUS, "Council team",
                    "Status changed to Resolved: valve replaced, pressure restored. Thank you for reporting!", 6);

            Issue e = issues.save(issue("Drain blocked after rain",
                    "Water is backing up into the lane and entering two houses.",
                    Category.DRAINAGE, "Station Road underpass", "Ward 4 · Market",
                    "Sana M.", Status.REPORTED, Priority.URGENT, 30, 1));
            note(comments, e.getId(), Comment.Kind.STATUS, "Sana M.", "Issue reported.", 1);
            note(comments, e.getId(), Comment.Kind.COMMENT, "Ramesh (shopkeeper)",
                    "Same problem happened last monsoon. Please prioritise.", 1);

            Issue f = issues.save(issue("Broken bench in the park",
                    "The backrest is loose, but it is still usable.",
                    Category.PARKS, "Central Park, east side", "Ward 7 · Green Colony",
                    "Dev P.", Status.REJECTED, Priority.LOW, 3, 12));
            note(comments, f.getId(), Comment.Kind.STATUS, "Dev P.", "Issue reported.", 12);
            note(comments, f.getId(), Comment.Kind.STATUS, "Council team",
                    "Status changed to Rejected: this bench belongs to the residents' society. Please contact them.", 10);
        };
    }

    private static Issue issue(String title, String description, Category category, String location,
                               String ward, String reporter, Status status, Priority priority,
                               int upvotes, int daysAgo) {
        Issue i = new Issue();
        i.setTitle(title);
        i.setDescription(description);
        i.setCategory(category);
        i.setLocation(location);
        i.setWard(ward);
        i.setReporterName(reporter);
        i.setStatus(status);
        i.setPriority(priority);
        i.setUpvotes(upvotes);
        i.setCreatedAt(LocalDateTime.now().minusDays(daysAgo));
        i.setUpdatedAt(i.getCreatedAt());
        return i;
    }

    private static void note(CommentRepository repo, Long issueId, Comment.Kind kind,
                             String author, String text, int daysAgo) {
        Comment c = new Comment();
        c.setIssueId(issueId);
        c.setKind(kind);
        c.setAuthor(author);
        c.setText(text);
        c.setCreatedAt(LocalDateTime.now().minusDays(daysAgo));
        repo.save(c);
    }
}
