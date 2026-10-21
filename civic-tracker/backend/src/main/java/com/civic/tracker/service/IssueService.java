package com.civic.tracker.service;

import com.civic.tracker.model.Comment;
import com.civic.tracker.model.Issue;
import com.civic.tracker.model.Issue.Category;
import com.civic.tracker.model.Issue.Priority;
import com.civic.tracker.model.Issue.Status;
import com.civic.tracker.repository.CommentRepository;
import com.civic.tracker.repository.IssueRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Set;

@Service
public class IssueService {

    /** The allowed workflow. Anything else is rejected with 409 Conflict. */
    private static final Map<Status, Set<Status>> NEXT = new EnumMap<>(Status.class);

    static {
        NEXT.put(Status.REPORTED, EnumSet.of(Status.ACKNOWLEDGED, Status.REJECTED));
        NEXT.put(Status.ACKNOWLEDGED, EnumSet.of(Status.IN_PROGRESS, Status.REJECTED));
        NEXT.put(Status.IN_PROGRESS, EnumSet.of(Status.RESOLVED, Status.ACKNOWLEDGED));
        NEXT.put(Status.RESOLVED, EnumSet.noneOf(Status.class));
        NEXT.put(Status.REJECTED, EnumSet.noneOf(Status.class));
    }

    private static final Comparator<Issue> NEWEST_FIRST =
            (a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt());

    private final IssueRepository issues;
    private final CommentRepository comments;

    public IssueService(IssueRepository issues, CommentRepository comments) {
        this.issues = issues;
        this.comments = comments;
    }

    /** Public feed. sort = "top" (most upvotes) or anything else for newest first. */
    @Transactional(readOnly = true)
    public List<Issue> list(Category category, String q, String sort) {
        String term = q == null ? "" : q.trim().toLowerCase(Locale.ROOT);
        Comparator<Issue> order = "top".equalsIgnoreCase(sort)
                ? Comparator.comparingInt(Issue::getUpvotes).reversed().thenComparing(NEWEST_FIRST)
                : NEWEST_FIRST;

        return issues.findAll().stream()
                .filter(i -> category == null || i.getCategory() == category)
                .filter(i -> term.isEmpty() || matches(i, term))
                .sorted(order)
                .toList();
    }

    @Transactional(readOnly = true)
    public Issue get(Long id) {
        return issues.findById(id).orElseThrow(() -> new NoSuchElementException("Issue not found"));
    }

    @Transactional(readOnly = true)
    public List<Comment> timeline(Long id) {
        get(id); // 404 if missing
        return comments.findByIssueIdOrderByCreatedAtAsc(id);
    }

    @Transactional
    public Issue create(Issue input) {
        input.setId(null);
        input.setStatus(Status.REPORTED);
        input.setUpvotes(0);
        input.setPriority(Priority.MEDIUM);
        Issue saved = issues.save(input);
        comments.save(entry(saved.getId(), Comment.Kind.STATUS, saved.getReporterName(), "Issue reported."));
        return saved;
    }

    /** Adds one vote. A real app would track voters per account to stop repeat votes. */
    @Transactional
    public Issue upvote(Long id) {
        Issue issue = get(id);
        if (isClosed(issue)) {
            throw new IllegalStateException("This issue is already closed");
        }
        issue.setUpvotes(issue.getUpvotes() + 1);
        return issue;
    }

    @Transactional
    public Comment addComment(Long id, String author, String text) {
        get(id);
        return comments.save(entry(id, Comment.Kind.COMMENT, author.trim(), text.trim()));
    }

    /**
     * Council desk action. Pass a status to move the issue through the workflow,
     * a priority to change urgency, or both. Status moves are written to the public timeline.
     */
    @Transactional
    public Issue update(Long id, Status target, String note, Priority priority) {
        Issue issue = get(id);

        if (target == null && priority == null) {
            throw new IllegalArgumentException("Provide a status or a priority");
        }
        if (priority != null) {
            issue.setPriority(priority);
        }
        if (target == null) {
            return issue;
        }

        Status current = issue.getStatus();
        if (target == current) {
            throw new IllegalStateException("Issue is already " + label(current));
        }
        if (!NEXT.get(current).contains(target)) {
            throw new IllegalStateException("Cannot move from " + label(current) + " to " + label(target));
        }

        issue.setStatus(target);
        String text = "Status changed to " + label(target)
                + (note == null || note.isBlank() ? "." : ": " + note.trim());
        comments.save(entry(id, Comment.Kind.STATUS, "Council team", text));
        return issue;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> stats() {
        List<Issue> all = issues.findAll();
        Map<Status, Long> byStatus = new EnumMap<>(Status.class);
        for (Issue i : all) {
            byStatus.merge(i.getStatus(), 1L, Long::sum);
        }
        long total = all.size();
        long resolved = byStatus.getOrDefault(Status.RESOLVED, 0L);
        long rejected = byStatus.getOrDefault(Status.REJECTED, 0L);
        double rate = total == 0 ? 0 : (double) resolved / total;

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("total", total);
        m.put("open", total - resolved - rejected);
        m.put("inProgress", byStatus.getOrDefault(Status.IN_PROGRESS, 0L));
        m.put("resolved", resolved);
        m.put("rejected", rejected);
        m.put("resolutionRate", Math.round(rate * 1000) / 10.0);
        return m;
    }

    // ---- helpers ------------------------------------------------------------

    private static boolean isClosed(Issue i) {
        return i.getStatus() == Status.RESOLVED || i.getStatus() == Status.REJECTED;
    }

    private static boolean matches(Issue i, String term) {
        return contains(i.getTitle(), term) || contains(i.getDescription(), term)
                || contains(i.getLocation(), term) || contains(i.getWard(), term);
    }

    private static boolean contains(String s, String term) {
        return s != null && s.toLowerCase(Locale.ROOT).contains(term);
    }

    private static String label(Status s) {
        String n = s.name().replace('_', ' ').toLowerCase(Locale.ROOT);
        return Character.toUpperCase(n.charAt(0)) + n.substring(1);
    }

    private static Comment entry(Long issueId, Comment.Kind kind, String author, String text) {
        Comment c = new Comment();
        c.setIssueId(issueId);
        c.setKind(kind);
        c.setAuthor(author);
        c.setText(text);
        return c;
    }
}
