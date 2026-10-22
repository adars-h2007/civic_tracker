# Local Civic Issue Reporting & Resolution Tracker

A web app that lets residents report local civic problems, such as potholes, broken streetlights and garbage, and lets authorities track each issue until it is resolved.

## Features

- Report a civic issue with a title, description and location
- Track the status of each issue from reported to resolved
- Browse and filter reported issues
- Clean, attractive, responsive interface

<!-- Edit this list to match what the app does today. Ideas if you have built them:
- Photo upload for issues
- Categories (roads, water, electricity, sanitation)
- Admin view to update status and assign issues
- Login for citizens and officials
-->

## Tech used

| Layer | Technology |
|---|---|
| Frontend | React, CSS, JavaScript |
| Backend | Java |
| Database | MySQL |

## Project structure

```
civic_tracker/
└── civic-tracker/
    ├── ...            # frontend / backend folders, see below
    └── README.md
```

<!-- Replace the tree above with your real folders, for example:
civic-tracker/
├── frontend/   # React app
├── backend/    # Java API
└── database/   # MySQL schema (schema.sql)
-->

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS)
- Java JDK 17 or newer
- MySQL 8 or newer

### 1. Clone the repository

```bash
git clone https://github.com/adars-h2007/civic_tracker.git
cd civic_tracker/civic-tracker
```

### 2. Set up the database

```sql
CREATE DATABASE civic_tracker;
```

Import the schema file if the project includes one, then update the database username and password in the backend's configuration file.

### 3. Run the backend

```bash
cd backend
# Maven
mvn spring-boot:run
# or Gradle
./gradlew bootRun
```

### 4. Run the frontend

```bash
cd frontend
npm install
npm start
```

Open `http://localhost:3000` in your browser.

<!-- Adjust the folder names, build tool (Maven / Gradle / plain Java), start command (npm start / npm run dev) and ports to match your project. -->

## Roadmap

- [ ] Photo uploads for reported issues
- [ ] Email or SMS updates when an issue's status changes
- [ ] Map view of reported issues

## Author

**Adarsh Patil**

- GitHub: [@adars-h2007](https://github.com/adars-h2007)
- LinkedIn: [Adarsh Patil](https://www.linkedin.com/in/adarsh-patil-587a65319/)
- Email: adarshpatil6650@gmail.com
