# DevPath — Dynamic Software Engineering Roadmap Engine

DevPath is a production-grade software engineering roadmap and master study scheduler. It features dynamic relational roadmap management, modular curriculum organization, granular task tracking, independent start date calculations, and multi-track progression.

---

## 🏗️ Architecture & Technology Stack

- **Runtime**: Node.js (v22+ with standard ES Modules)
- **Framework**: Express.js (v4.21+)
- **Database**: Supabase PostgreSQL (v17.11)
- **ORM & Migrations**: Prisma ORM (v5.22+)
- **Validation**: Zod (v3.23+)
- **Timezone**: `Asia/Kolkata` (default for scheduled dates and streak tracking)

---

## 🗄️ Relational Database Schema & Entities

The database schema utilizes normalized relational design with UUID primary keys, foreign key constraints, timestamps, and indexes:

| Table | Model | Description |
|---|---|---|
| `roadmap_categories` | `RoadmapCategory` | High-level roadmap categories (Full Stack, Database, CS Core, etc.) with unique names/slugs and display order. |
| `roadmaps` | `Roadmap` | Roadmaps with title, slug, duration, target study time, start date, status (`active`, `completed`, `archived`), icons, and themes. |
| `modules` | `Module` | Curricular modules with starting/ending day ranges and reorderable display sequence. |
| `roadmap_days` | `RoadmapDay` | Scheduled roadmap days with day number, title, objective, estimated time, and day type (`learning`, `practice`, `revision`, `project`, `assessment`). |
| `tasks` | `Task` | Granular independent tasks with title, description, task type (`learn`, `code`, `practice`, `revise`, `project`, `assessment`), duration, and GitHub links. |
| `task_completions` | `TaskCompletion` | Real-time task completion toggle records with timestamps and notes. Prevents duplicate active completions. |
| `daily_notes` | `DailyNote` | Rich Markdown notes associated with roadmaps, specific days, or general study dates. |
| `resources` | `Resource` | External references (documentation, videos, articles, repositories) linked to roadmaps or tasks. |
| `revision_schedule` | `RevisionSchedule` | Spaced repetition intervals linked to roadmaps and tasks. |
| `projects` | `Project` | Mini-projects and capstone milestones with repository and demo URLs. |
| `task_reassignments` | `TaskReassignment` | Audit log tracking moved tasks between days without duplicating the underlying record. |

---

## 🚀 Environment Configuration

Backend `.env.example`:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgresql://postgres.asagzupuflkwquryixel:5rt6rt7rt8rt@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
DIRECT_URL=postgresql://postgres.asagzupuflkwquryixel:5rt6rt7rt8rt@aws-0-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require
```

> **Note on Supabase Pooler**: On networks without IPv6 routing, direct port 5432 connects via the Supabase session pooler on port 5432, while runtime transactions use port 6543 (`pgbouncer=true`).

---

## 📦 Scripts

```bash
# Install dependencies
npm install

# Apply Prisma Migrations
npm run prisma:deploy

# Run High-Performance Master Seeding
npm run seed

# Run Seed Validation Audit
npm run seed:validate

# Run Backend Integration Test Suite
npm test

# Start Development Server
npm run dev
```

---

## 🌐 API Endpoint Documentation

### System Health
- `GET /api/health` — PostgreSQL database connectivity, latency, and system uptime.

### Categories
- `GET /api/categories` — List all categories with roadmap counts.
- `POST /api/categories` — Create a new category (`name`, `slug`, `description`, `displayOrder`).
- `GET /api/categories/:id` — Get category details with nested roadmaps.
- `PATCH /api/categories/:id` — Update category fields.
- `DELETE /api/categories/:id` — Delete category (rejects if it contains roadmaps unless `?cascade=true`).

### Roadmaps
- `GET /api/roadmaps` — Paginated roadmap listings (`page`, `limit`, `categoryId`, `status`).
- `POST /api/roadmaps` — Create a new roadmap (`categoryId`, `title`, `slug`, `duration`, `targetDailyStudyTime`, `startDate`).
- `GET /api/roadmaps/:id` — Retrieve roadmap with full modules, days, tasks, and calculated scheduled dates.
- `PATCH /api/roadmaps/:id` — Update roadmap properties.
- `DELETE /api/roadmaps/:id` — Archive roadmap by default (`status: 'archived'`). If `?permanent=true&confirm=true`, permanently deletes transactionally.
- `POST /api/roadmaps/:id/restore` — Restores archived roadmap back to `active`.

### Modules
- `GET /api/roadmaps/:id/modules` — List modules for a roadmap.
- `POST /api/roadmaps/:id/modules` — Add a module to a roadmap (validates `startingDay <= endingDay <= roadmap.duration`).
- `PATCH /api/modules/:id` — Update module.
- `DELETE /api/modules/:id` — Delete module.

### Days
- `GET /api/roadmaps/:id/days` — List all days for a roadmap with dynamically calculated `scheduledDate`.
- `POST /api/roadmaps/:id/days` — Add day to a roadmap (enforces unique `dayNumber` per roadmap).
- `GET /api/days/:id` — Get day with nested tasks.
- `PATCH /api/days/:id` — Update day details.
- `DELETE /api/days/:id` — Delete day.

### Tasks
- `GET /api/days/:id/tasks` — List tasks for a day.
- `POST /api/days/:id/tasks` — Create task (`title`, `description`, `taskType`, `estimatedDuration`, `isRequired`).
- `GET /api/tasks/:id` — Get task details with completion history.
- `PATCH /api/tasks/:id` — Update task.
- `DELETE /api/tasks/:id` — Delete task.
- `POST /api/tasks/:id/complete` — Toggle completion checkbox (`completed: true/false`, optional `notes`).
- `POST /api/tasks/:id/reassign` — Move task to a different day without duplication (`newRoadmapDayId`, `reason`).
