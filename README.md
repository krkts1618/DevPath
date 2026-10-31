# DevPath – Personal Engineering Learning Tracker & Placement Operating System

DevPath is a high-performance, single-user full-stack engineering curriculum and productivity tracker designed to guide an engineer from Day 1 fundamentals through advanced distributed systems, algorithms, system design, and placement preparation.

Connected to **Supabase PostgreSQL** and deployed to **Render** (Backend API + Cron) and **Vercel** (Frontend SPA), DevPath combines adaptive curriculum progression, 5-task daily streak mechanics, Pomodoro focus tracking, spaced repetition revisions, full technical notes workspace, project portfolio tracking, intelligent background reminders, and deep engineering analytics.

---

## 🏛 Architecture & Tech Stack

```
                                  +------------------------------------+
                                  |         Vercel (Frontend)          |
                                  |    React 19 + Vite 8 + Tailwind    |
                                  |    Route Splitting (308 kB Core)   |
                                  +-----------------+------------------+
                                                    |
                                HTTPS (Strict CORS, Bearer/Header Secret)
                                                    |
                                  +-----------------v------------------+
                                  |         Render (Backend)           |
                                  |     Node.js 22 + Express 4 API     |
                                  |  Helmet, Rate-Limit, Auth Secret   |
                                  +--------+-----------------+---------+
                                           |                 |
                                Runtime Queries         DDL Migrations
                             (Transaction Pooler: 6543)  (Direct: 5432)
                                           |                 |
                                  +--------v-----------------v---------+
                                  |        Supabase PostgreSQL         |
                                  |    11 Relational Tables + Inds     |
                                  +------------------------------------+
```

### Stack Components
- **Frontend**: React 19, Vite 8, JavaScript, Tailwind CSS 4, React Router 7, Axios, Lucide React, Recharts.
- **Backend**: Node.js 22, Express 4, Prisma ORM 5.21, Zod validation, Helmet 8, Express-Rate-Limit 8, Multer 2.
- **Database**: Supabase PostgreSQL (`aws-0-eu-west-1.pooler.supabase.com`).
- **Timezone**: `Asia/Kolkata` (IST, UTC+05:30) enforced for all calendar calculations and daily boundaries.

---

## 🚀 Complete Application Features & Pages

| Route | Page | Purpose & Core Capabilities |
| :--- | :--- | :--- |
| `/` | **Dashboard** | Command center featuring streak status, today's focus metrics, next-up tasks across active roadmaps, weekly activity distribution, and urgent reminders. |
| `/planner` | **Daily Planner** | Unified daily learning queue displaying frontier tasks across independent tracks, personal ad-hoc tasks, carried-forward rollover tasks, and instant task completion toggles. |
| `/focus` | **Focus Timer** | Full-screen & header-accessible focus companion with Pomodoro (25/5/15), custom durations (1–180m), stopwatch, pause/resume, and association to specific roadmap tasks or projects. |
| `/calendar` | **Learning Calendar** | Interactive month/day view mapping curriculum milestones, scheduled rest days, study history, and overdue task distributions. |
| `/roadmaps` | **My Roadmaps** | Curriculum library listing all active and paused roadmaps, modular milestones, progress percentages, and independent track configurations. |
| `/roadmaps/:id`| **Roadmap Detail** | Granular module and day hierarchy breakdown, day objectives, resource links, task reassignment modal, and mark-all-day-complete actions. |
| `/analytics` | **Analytics & Insights**| 6-tab deep engineering analytics suite: velocity charts, category balance, cognitive focus time heatmaps, spaced repetition retention rates, and smart placement recommendations. |
| `/notes` | **Notes Workspace** | Technical markdown knowledge-management workspace with tags, code block previews, full-text search, attachments (.png, .pdf, .json, .md), and linking to roadmap days. |
| `/revision` | **Revision Schedules** | Automated Leitner/Ebbinghaus spaced-repetition engine (1, 3, 7, 14, 30, 60 days) tracking retention ratings (again, hard, good, easy) and overdue topics. |
| `/projects` | **Project Portfolio** | Placement engineering projects manager featuring 50% milestone + 50% task weighted progress, GitHub repository links, and live demo URLs. |
| `/notifications`| **Notification Center**| Centralized hub for learning alerts, streak danger warnings, quiet-hours suppression, and custom reminder schedule management. |
| `/settings` | **Settings** | Configuration for daily study targets, rest days, quiet hours, light/dark theme toggle, and the **Cloud Production Access Secret**. |

---

## 🔒 Security Hardening

DevPath is engineered for personal single-user security without requiring cumbersome multi-user registration or password databases:

1. **Application Access Secret (`APP_ACCESS_SECRET`)**:
   - Write/mutation routes (`POST`, `PUT`, `PATCH`, `DELETE`) are protected by a configurable bearer/header secret (`x-app-access-secret`).
   - Read-only queries (`GET`) and `/api/health` remain open for monitoring.
   - The user enters their secret once in **Settings > Cloud Production Access Secret**, securely stored in browser `localStorage`.
2. **Helmet Security Headers**:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: SAMEORIGIN`
   - `Cross-Origin-Resource-Policy: cross-origin`
3. **Strict CORS Policy**:
   - Allowed origins are restricted to configured Vercel production URLs, localhost, and custom domains. Arbitrary web origins are rejected.
4. **Rate Limiting**:
   - Protected with `express-rate-limit` capped at 1,000 requests per 15-minute sliding window per IP to prevent API abuse or crawler exhaustion on Render.
5. **Information Disclosure Sanitization**:
   - `/api/health` sanitizes database health telemetry, returning only `UP/DOWN` and latency without ever leaking PostgreSQL version, hostnames, usernames, or connection strings.
6. **File Upload Hardening**:
   - Multer discards any executable, script, or disallowed extensions (`.exe`, `.sh`, `.php`, `.bat`). Only validated images, PDFs, text, markdown, and JSON files up to 15MB are accepted.

---

## ⚡ Performance Optimizations

1. **Route-Level Code Splitting**:
   - Implemented dynamic `React.lazy()` chunking across all 12 page routes.
   - Core initial JavaScript bundle decreased from **1,283 kB** down to **308 kB** (95 kB gzipped).
   - Heavy visualization libraries (Recharts) are isolated into on-demand chunks.
2. **Database Query Telemetry**:
   - Exposed `Server-Timing` headers on all API responses (`dur=...ms`).
   - Consolidated parallel lookups using `Promise.all()` across streak, planner, and dashboard controllers.
3. **Prisma Relational Indexing**:
   - Compound indexes on `[roadmapId, dayNumber]`, `[completed, completedAt]`, `[status]`, and `[categoryId]`.

---

## 🛠 Local Development Setup

### Prerequisites
- Node.js >= 20.x
- PostgreSQL database or Supabase account

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone <repo-url>
cd devpath

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration
Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
DATABASE_URL="your-supabase-connection-pooler-url"
DIRECT_URL="your-supabase-direct-url"
APP_ACCESS_SECRET="your-development-secret-optional"
```

Create `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_ACCESS_SECRET="your-development-secret-optional"
```

### 3. Generate Prisma Client & Run
```bash
# In backend/
npx prisma generate
npm run dev

# In frontend/
npm run dev
```

Visit `http://localhost:5173`.

---

## ☁ Production Deployment Guide

### A. Database (Supabase PostgreSQL)
1. In your Supabase Dashboard, go to **Project Settings > Database**.
2. Locate the **Connection string**:
   - **Transaction Pooler (Port 6543)**: Use this for `DATABASE_URL` (append `?pgbouncer=true&connection_limit=1`).
   - **Direct Connection (Port 5432)**: Use this for `DIRECT_URL` (required for Prisma migrations).

---

### B. Backend Deployment on Render

DevPath includes ready-to-use Render Blueprint files (`render.yaml`).

#### Step-by-Step Manual or Blueprint Setup:
1. Log in to [Render](https://render.com) and click **New + > Web Service** (or create from Blueprint `render.yaml`).
2. Connect your Git repository.
3. Configure the **Web Service**:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `node src/server.js`
   - **Health Check Path**: `/api/health`
4. Add the following **Environment Variables** in Render:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `DATABASE_URL`: *(Your Supabase transaction pooler URL)*
   - `DIRECT_URL`: *(Your Supabase direct connection URL)*
   - `FRONTEND_URL`: `https://your-app.vercel.app`
   - `APP_ACCESS_SECRET`: *(Generate a secure 32+ character random secret)*
5. **Background Reminder Worker (Render Cron Job)**:
   - To ensure reminders trigger even if the free Web Service enters sleep mode, create a **Cron Job** in Render:
   - **Command**: `node src/scripts/process-reminders.js`
   - **Schedule**: `*/15 * * * *` (Every 15 minutes)
   - Share the same `DATABASE_URL` and `DIRECT_URL`.

---

### C. Frontend Deployment on Vercel

DevPath includes preconfigured `vercel.json` files for SPA client-side routing fallback.

1. Log in to [Vercel](https://vercel.com) and click **Add New > Project**.
2. Import your Git repository.
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add **Environment Variables** in Vercel:
   - `VITE_API_BASE_URL`: `https://your-render-api.onrender.com/api`
   - `VITE_APP_ACCESS_SECRET`: *(Optional build-time default matching Render's APP_ACCESS_SECRET)*
5. Click **Deploy**.
6. Open your live Vercel URL. Go to **Settings > Cloud Production Access Secret** and paste your `APP_ACCESS_SECRET`. Your personal client is now authenticated to perform writes.

---

## 🧪 Automated Testing & Verification

DevPath includes comprehensive test suites covering database integrity, API routes, security guards, and progression engines:

```bash
cd backend

# Run the complete Production Readiness & Security Verification Suite
npm run test:readiness

# Run the full CRUD Lifecycle Integration Suite
npm run test:lifecycle
```

### Verification Suite Coverage (19 Automated Tests):
- ✅ Health endpoint security & data sanitization
- ✅ Information disclosure prevention (passwords, hosts, versions)
- ✅ Helmet security headers (`nosniff`, `cross-origin`)
- ✅ `Server-Timing` telemetry
- ✅ Single-user `APP_ACCESS_SECRET` enforcement & rejection
- ✅ File upload extension & MIME validation
- ✅ Adaptive roadmap progression engine
- ✅ Independent roadmap track progression
- ✅ 5-task daily streak calculation
- ✅ Daily planner unified queue aggregation
- ✅ Focus timer & study session analytics
- ✅ Spaced repetition revision scheduling
- ✅ 50/50 weighted project progress calculation
- ✅ Standalone reminder worker idempotency

---

## 💾 Database Backup & Disaster Recovery

### Manual Backup via `pg_dump`
```bash
pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" > devpath_backup_$(date +%Y%m%d).sql
```

### Automated Supabase Backups
Supabase automatically manages daily point-in-time snapshots under **Project Settings > Database > Backups**.

---

## 📜 License & Usage
Personal Engineering Learning Operating System. Developed for placement preparation and lifelong engineering mastery.
