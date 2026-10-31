// Advanced Engineering Specialization Curriculum (126 Days, 15 Modules)

const advancedModules = [
  {
    title: 'Module A: Database Architecture & Production PostgreSQL',
    description: 'Storage engine internals, MVCC, WAL durability, B-tree page splits, GIN indexes, and zero-downtime migrations.',
    startingDay: 1,
    endingDay: 14,
    displayOrder: 1,
  },
  {
    title: 'Module B: Node.js Runtime Internals & Backend Architecture',
    description: 'V8 memory heap, Libuv event loop phases, connection pools, custom error architectures, and asynchronous workers.',
    startingDay: 15,
    endingDay: 28,
    displayOrder: 2,
  },
  {
    title: 'Module C: Advanced React & State Architecture',
    description: 'React Fiber reconciliation, Redux Toolkit, TanStack Query server state, custom hooks, and micro-frontend patterns.',
    startingDay: 29,
    endingDay: 42,
    displayOrder: 3,
  },
  {
    title: 'Module D: Production API Engineering',
    description: 'RESTful resource modeling, HTTP caching headers, rate limiting algorithms, idempotency keys, and OpenAPI 3.0.',
    startingDay: 43,
    endingDay: 49,
    displayOrder: 4,
  },
  {
    title: 'Module E: Performance, Scalability & Benchmarking',
    description: 'Latency metrics, cache-aside patterns, cache stampede mitigation, Node.js memory profiling, and k6 load testing.',
    startingDay: 50,
    endingDay: 56,
    displayOrder: 5,
  },
  {
    title: 'Module F: System Design & High-Level Architecture',
    description: 'Capacity estimation, load balancing strategies, database sharding/replication, CDN edge caching, and message queues.',
    startingDay: 57,
    endingDay: 63,
    displayOrder: 6,
  },
  {
    title: 'Module G: Distributed Systems & Event-Driven Patterns',
    description: 'CAP theorem, PACELC, Apache Kafka/RabbitMQ pub-sub, Saga distributed transactions, and Outbox pattern.',
    startingDay: 64,
    endingDay: 70,
    displayOrder: 7,
  },
  {
    title: 'Module H: Application Security & Threat Modeling',
    description: 'OWASP Top 10 vulnerabilities, SQL injection, XSS, CSRF, RBAC/ABAC authorization models, and secrets encryption.',
    startingDay: 71,
    endingDay: 77,
    displayOrder: 8,
  },
  {
    title: 'Module I: Testing, Quality Gates & Test Automation',
    description: 'Testing pyramid, Vitest unit testing, Supertest API contract testing, Playwright E2E automation, and coverage gates.',
    startingDay: 78,
    endingDay: 84,
    displayOrder: 9,
  },
  {
    title: 'Module J: DevOps, Containers & Deployment Pipelines',
    description: 'Linux systems engineering, multi-stage Docker builds, Docker Compose, GitHub Actions CI/CD, and blue-green deployments.',
    startingDay: 85,
    endingDay: 91,
    displayOrder: 10,
  },
  {
    title: 'Module K: Observability, Metrics & SRE Fundamentals',
    description: 'Structured logging, OpenTelemetry distributed tracing, Prometheus metrics, Grafana dashboards, and SLO/SLA error budgets.',
    startingDay: 92,
    endingDay: 98,
    displayOrder: 11,
  },
  {
    title: 'Module L: Enterprise Architecture & Domain-Driven Design',
    description: 'Modular monoliths vs microservices, DDD bounded contexts, Clean / Hexagonal Architecture, and ADR trade-offs.',
    startingDay: 99,
    endingDay: 105,
    displayOrder: 12,
  },
  {
    title: 'Module M: AI Engineering, Token Optimization & RAG Systems',
    description: 'LLM context windows, prompt engineering, vector embeddings, chunking strategies, RAG retrieval, and AI guardrails.',
    startingDay: 106,
    endingDay: 112,
    displayOrder: 13,
  },
  {
    title: 'Module N: Capstone: Open Research Collaboration Platform',
    description: 'End-to-end full-stack capstone project: workspaces, documents, RBAC, Redis caching, AI summaries, and production deployment.',
    startingDay: 113,
    endingDay: 119,
    displayOrder: 14,
  },
  {
    title: 'Module O: Final Engineering Audit & Career Readiness',
    description: 'Comprehensive code reviews, security scans, performance benchmarks, architecture documentation, and mock interviews.',
    startingDay: 120,
    endingDay: 126,
    displayOrder: 15,
  },
];

const moduleIndexRanges = [
  { start: 1, end: 14, modIdx: 0, title: 'Database Architecture & Production PostgreSQL' },
  { start: 15, end: 28, modIdx: 1, title: 'Node.js Runtime Internals & Backend Architecture' },
  { start: 29, end: 42, modIdx: 2, title: 'Advanced React & State Architecture' },
  { start: 43, end: 49, modIdx: 3, title: 'Production API Engineering' },
  { start: 50, end: 56, modIdx: 4, title: 'Performance, Scalability & Benchmarking' },
  { start: 57, end: 63, modIdx: 5, title: 'System Design & High-Level Architecture' },
  { start: 64, end: 70, modIdx: 6, title: 'Distributed Systems & Event-Driven Patterns' },
  { start: 71, end: 77, modIdx: 7, title: 'Application Security & Threat Modeling' },
  { start: 78, end: 84, modIdx: 8, title: 'Testing, Quality Gates & Test Automation' },
  { start: 85, end: 91, modIdx: 9, title: 'DevOps, Containers & Deployment Pipelines' },
  { start: 92, end: 98, modIdx: 10, title: 'Observability, Metrics & SRE Fundamentals' },
  { start: 99, end: 105, modIdx: 11, title: 'Enterprise Architecture & Domain-Driven Design' },
  { start: 106, end: 112, modIdx: 12, title: 'AI Engineering, Token Optimization & RAG Systems' },
  { start: 113, end: 119, modIdx: 13, title: 'Capstone: Open Research Collaboration Platform' },
  { start: 120, end: 126, modIdx: 14, title: 'Final Engineering Audit & Career Readiness' },
];

const dayData = [];

for (let d = 1; d <= 126; d++) {
  const range = moduleIndexRanges.find((r) => d >= r.start && d <= r.end);
  const modIdx = range.modIdx;
  const modTitle = range.title;
  const dayInModule = d - range.start + 1;

  dayData.push({
    dayNumber: d,
    moduleIndex: modIdx,
    title: `Day ${d}: ${modTitle} - Part ${dayInModule}`,
    objective: `Master advanced engineering trade-offs, architecture decisions, and practical implementations for Day ${d} in ${modTitle}.`,
    tasks: [
      {
        title: `Analyze system trade-offs and engineering design patterns for Day ${d}`,
        desc: `Deep dive into architectural principles, low-level mechanics, and enterprise standards in ${modTitle}.`,
        type: 'learn',
        dur: 30,
      },
      {
        title: `Implement practical engineering solution or configuration for Day ${d}`,
        desc: `Write clean code, configure infrastructure, or build production components for Day ${d}.`,
        type: d % 7 === 0 ? 'project' : 'code',
        dur: 35,
      },
      {
        title: `Validate performance, conduct architecture review, and document trade-offs`,
        desc: `Measure latency, inspect edge cases, write tests, and document Architecture Decision Records (ADRs).`,
        type: 'practice',
        dur: 25,
      },
    ],
  });
}

export const advancedSpecCurriculum = {
  roadmapSlug: 'advanced-engineering-specialization',
  modules: advancedModules,
  days: dayData.map((d) => ({
    dayNumber: d.dayNumber,
    moduleIndex: d.moduleIndex,
    title: d.title,
    objective: d.objective,
    estimatedStudyTime: 90,
    dayType: d.dayNumber % 7 === 0 ? 'project' : d.dayNumber % 3 === 0 ? 'practice' : 'learning',
    tasks: d.tasks.map((t, idx) => ({
      title: t.title,
      description: t.desc,
      taskType: t.type,
      estimatedDuration: t.dur,
      displayOrder: idx + 1,
    })),
  })),
};
