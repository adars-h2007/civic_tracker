package com.civic.tracker.controller;

import com.civic.tracker.model.Comment;
import com.civic.tracker.model.Issue;
import com.civic.tracker.model.Issue.Category;
import com.civic.tracker.model.Issue.Priority;
import com.civic.tracker.model.Issue.Status;
import com.civic.tracker.service.IssueService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class IssueController {

    public record IssueDetail(Issue issue, List<Comment> timeline) {}

    public record CommentRequest(
            @NotBlank @Size(max = 80) String author,
            @NotBlank @Size(max = 500) String text) {}

    public record StatusRequest(Status status, @Size(max = 300) String note, Priority priority) {}

    private final IssueService service;

    public IssueController(IssueService service) {
        this.service = service;
    }

    @GetMapping("/issues")
    public List<Issue> list(@RequestParam(required = false) Category category,
                            @RequestParam(required = false) String q,
                            @RequestParam(required = false, defaultValue = "new") String sort) {
        return service.list(category, q, sort);
    }

    @GetMapping("/issues/{id}")
    public IssueDetail detail(@PathVariable Long id) {
        return new IssueDetail(service.get(id), service.timeline(id));
    }

    @PostMapping("/issues")
    @ResponseStatus(HttpStatus.CREATED)
    public Issue create(@Valid @RequestBody Issue issue) {
        return service.create(issue);
    }

    @PostMapping("/issues/{id}/upvote")
    public Issue upvote(@PathVariable Long id) {
        return service.upvote(id);
    }

    @PostMapping("/issues/{id}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public Comment comment(@PathVariable Long id, @Valid @RequestBody CommentRequest req) {
        return service.addComment(id, req.author(), req.text());
    }

    /** Council desk: move status and/or change priority. */
    @PutMapping("/issues/{id}/status")
    public Issue update(@PathVariable Long id, @RequestBody StatusRequest req) {
        return service.update(id, req.status(), req.note(), req.priority());
    }

    @GetMapping("/stats")
    public Map<String, Object> stats() {
        return service.stats();
    }
}
