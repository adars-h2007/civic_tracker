# CivicPulse · Local Civic Issue Reporting and Resolution Tracker

Residents register and sign in to report local problems (potholes, broken street lights, blocked drains, garbage),
back issues that affect them, and follow each one through a public timeline until the
council resolves it. A council desk moves issues through the workflow and posts updates.

| Layer    | Tech                                    |
|----------|-----------------------------------------|
| Frontend | React 18 (Vite), plain CSS, JavaScript  |
| Backend  | Java 17, Spring Boot 3, Spring Data JPA |
| Database | MySQL 8                                 |

## Features

- **Public feed:** hero stats, category chips, search, Open / Resolved filter, sort by most supported or newest.
- **Report an issue:** category picker, location, ward, details and reporter name.
- **Progress tracker:** every card shows Reported → Acknowledged → In progress → Resolved.
- **Back an issue:** upvote to show that it affects many people; the feed can sort by support.
- **Issue detail:** full info, a timeline of status changes and comments, and a comment form.
- **Council desk:** a kanban board by status. Move issues forward (with a public note), set priority, or reject with a reason.
- **Accounts:** register and sign in with credentials stored in MySQL; passwords are BCrypt-hashed and browser sessions are held by the backend.
- **Two account types:** Residents report and support issues; issue solvers use the issue desk to update status and priority.

## Workflow

```
REPORTED ──► ACKNOWLEDGED ──► IN_PROGRESS ──► RESOLVED
    │              │               │
    └──────────────┴───────────────┴──► REJECTED
```

Closed issues (Resolved, Rejected) can't be upvoted. Invalid moves return HTTP 409.
Every status change is written to the public timeline.

## Project structure

```
civic-tracker/
├── backend/    Spring Boot REST API (port 8080)
├── frontend/   React app (port 5173)
└── database/   schema.sql (optional, tables are auto-created)
```

## 1. Database

Start MySQL. The backend creates the `civic_tracker` database and its tables on first run.
Default credentials are `root` / `root`. Override them with environment variables:

```bash
export DB_USER=root
export DB_PASSWORD=root
```

`database/schema.sql` includes the account role column and an idempotent migration for older databases; run it with the MySQL client if managing the schema manually.

## 2. Backend

Requires JDK 17+ and Maven.

```bash
cd backend
mvn spring-boot:run
```

On the first run, six demo issues with timelines are added.
The backend creates the accounts table automatically. Registration requires a name, a valid email address, a password of at least 8 characters, and an account type (Resident or Issue solver). Existing accounts without a saved type are treated as Residents.

Authentication endpoints:

| Method | Endpoint              | Description                                |
|--------|-----------------------|--------------------------------------------|
| POST   | `/api/auth/register`  | Create an account (`role`: `RESIDENT` or `SOLVER`) and start a session |
| POST   | `/api/auth/login`     | Sign in (`role` must match the account) and start a session |
| GET    | `/api/auth/me`        | Return the current signed-in account       |
| POST   | `/api/auth/logout`    | End the current session                    |

Issue and stats endpoints require a signed-in session. Only Residents can report, upvote, or comment; only Issue solvers can change issue status. The frontend sends the session cookie and CSRF token automatically.

### API

| Method | Endpoint                          | Description                                                        |
|--------|-----------------------------------|--------------------------------------------------------------------|
| GET    | `/api/issues`                     | List issues. Optional: `category`, `q`, `sort=top\|new`            |
| GET    | `/api/issues/{id}`                | Issue plus its timeline                                            |
| POST   | `/api/issues`                     | Report an issue                                                    |
| POST   | `/api/issues/{id}/upvote`         | Back an issue                                                      |
| POST   | `/api/issues/{id}/comments`       | Add a comment (`author`, `text`)                                   |
| PUT    | `/api/issues/{id}/status`         | Solver-only: `status`, optional `note`, optional `priority`         |
| GET    | `/api/stats`                      | Totals, open, in progress, resolved, rejected, resolution rate     |

## 3. Frontend

Requires Node 18+.

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. If the API is elsewhere, copy `.env.example` to `.env` and set `VITE_API_URL`.

## Important before going live

- **Issue solver registration is self-service.** For production, require an administrator to approve solver accounts rather than allowing anyone to register with that role.
- **Upvotes aren't limited per person.** Tie votes to a verified account to stop repeat voting.
- **Photos aren't supported.** Adding image upload (stored in object storage) is a natural next step.

## Ideas for next steps

- Map view with pins for each issue (Leaflet or Google Maps)
- SMS or email to the reporter when the status changes
- Ward-level dashboards and average time to resolve
- Duplicate detection: suggest existing issues when someone reports something nearby
