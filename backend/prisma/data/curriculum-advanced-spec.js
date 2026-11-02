// Advanced Engineering Specialization Curriculum (126 Days, 15 Phases)
// Designed for production-grade full-stack engineering, system architecture, and SDE excellence.

export const advancedPhases = [
  {
    phase: 1,
    title: 'Phase 1: Database Engineering',
    goal: 'Goal: Become capable of designing databases based on application requirements, not just creating collections and inserting documents.',
    startingDay: 1,
    endingDay: 14,
  },
  {
    phase: 2,
    title: 'Phase 2: Node.js and Backend Engineering',
    goal: 'Goal: Understand how Node.js works internally and how to build maintainable backend systems.',
    startingDay: 15,
    endingDay: 28,
  },
  {
    phase: 3,
    title: 'Phase 3: Advanced React Engineering',
    goal: 'Goal: Move beyond basic React development and learn to architect, optimize, test and maintain large React applications.',
    startingDay: 29,
    endingDay: 42,
  },
  {
    phase: 4,
    title: 'Phase 4: API and Application Engineering',
    goal: 'Goal: Understand how to design professional APIs that other developers can consume reliably.',
    startingDay: 43,
    endingDay: 49,
  },
  {
    phase: 5,
    title: 'Phase 5: Performance and Scalability',
    goal: 'Goal: Learn how to identify bottlenecks and improve application performance using evidence.',
    startingDay: 50,
    endingDay: 56,
  },
  {
    phase: 6,
    title: 'Phase 6: System Design Foundations',
    goal: 'Goal: Learn how to design systems before writing code.',
    startingDay: 57,
    endingDay: 63,
  },
  {
    phase: 7,
    title: 'Phase 7: Distributed Systems and Messaging',
    goal: 'Goal: Understand how multiple services communicate and handle failures.',
    startingDay: 64,
    endingDay: 70,
  },
  {
    phase: 8,
    title: 'Phase 8: Security Engineering',
    goal: 'Goal: Learn to develop applications that protect user data and resist common attacks.',
    startingDay: 71,
    endingDay: 77,
  },
  {
    phase: 9,
    title: 'Phase 9: Testing and Quality Engineering',
    goal: 'Goal: Become comfortable testing applications instead of relying on manual verification.',
    startingDay: 78,
    endingDay: 84,
  },
  {
    phase: 10,
    title: 'Phase 10: DevOps and Deployment',
    goal: 'Goal: Understand how applications move from your local machine to production.',
    startingDay: 85,
    endingDay: 91,
  },
  {
    phase: 11,
    title: 'Phase 11: Observability and Production Operations',
    goal: 'Goal: Learn how to monitor, troubleshoot and maintain applications after deployment.',
    startingDay: 92,
    endingDay: 98,
  },
  {
    phase: 12,
    title: 'Phase 12: Advanced Data and Architecture Patterns',
    goal: 'Goal: Understand the engineering patterns used in larger applications and multi-tenant SaaS platforms.',
    startingDay: 99,
    endingDay: 105,
  },
  {
    phase: 13,
    title: 'Phase 13: AI API and Token Engineering',
    goal: 'Goal: Learn how to integrate AI features into applications without wasting tokens, money or infrastructure resources.',
    startingDay: 106,
    endingDay: 112,
  },
  {
    phase: 14,
    title: 'Phase 14: Production-Grade MERN Capstone',
    goal: 'Goal: Bring everything together in one serious application (collaborative project / substantial SaaS).',
    startingDay: 113,
    endingDay: 119,
  },
  {
    phase: 15,
    title: 'Phase 15: Engineering Audit and SDE Preparation',
    goal: 'Goal: Verify that you can independently understand and explain your engineering decisions.',
    startingDay: 120,
    endingDay: 126,
  },
];

export const advancedDayRows = [
  // Phase 1: Database Engineering (Days 1–14)
  {
    day: 1,
    topic: 'Database Fundamentals',
    concepts: 'DBMS, RDBMS, NoSQL, SQL vs NoSQL, OLTP, OLAP, ACID basics, database use cases',
    task: 'Compare MongoDB and PostgreSQL for a task management application. Write down which data model fits each use case and why.',
  },
  {
    day: 2,
    topic: 'Database Design',
    concepts: 'Entities, attributes, relationships, cardinality, ER diagrams, primary keys, foreign keys',
    task: 'Design an ER diagram for users, workspaces, boards, tasks, comments and memberships.',
  },
  {
    day: 3,
    topic: 'MongoDB Schema Design',
    concepts: 'Collections, documents, BSON, embedding, referencing, one-to-one, one-to-many, many-to-many',
    task: 'Design MongoDB schemas for your task management application. Justify every embedding and referencing decision.',
  },
  {
    day: 4,
    topic: 'Normalization',
    concepts: '1NF, 2NF, 3NF, functional dependencies, update anomalies, denormalization',
    task: 'Normalize a sample relational database to 3NF. Then compare it with a suitable MongoDB document design.',
  },
  {
    day: 5,
    topic: 'MongoDB CRUD',
    concepts: 'find, findOne, insertOne, insertMany, updateOne, updateMany, deleteOne, deleteMany, projections, sorting',
    task: 'Write 20 MongoDB queries for users, tasks and comments. Include filtering, sorting and bulk updates.',
  },
  {
    day: 6,
    topic: 'MongoDB Operators',
    concepts: 'Comparison, logical, element, array, update and evaluation operators; $in, $and, $or, $set, $push, $pull',
    task: 'Implement 15 practical queries using different operators. Test edge cases such as missing fields and empty arrays.',
  },
  {
    day: 7,
    topic: 'Aggregation Pipelines',
    concepts: '$match, $project, $group, $sort, $limit, $lookup, $unwind, $facet, $bucket',
    task: 'Build a dashboard showing task counts, overdue tasks, member performance and weekly completion.',
  },
  {
    day: 8,
    topic: 'Indexing Fundamentals',
    concepts: 'Indexes, B-tree concept, single-field indexes, selectivity, index creation, index overhead',
    task: 'Create indexes for common task queries. Compare execution plans before and after indexing.',
  },
  {
    day: 9,
    topic: 'Advanced Indexing',
    concepts: 'Compound, unique, partial, sparse, TTL, text and multikey indexes; index prefix',
    task: 'Create compound indexes for workspace, status and due-date queries. Test different field orders.',
  },
  {
    day: 10,
    topic: 'Query Optimization',
    concepts: 'explain(), COLLSCAN, IXSCAN, covered queries, projection optimization, slow queries',
    task: 'Create a deliberately slow endpoint. Identify its bottleneck and optimize it using query plans.',
  },
  {
    day: 11,
    topic: 'Transactions',
    concepts: 'ACID, atomicity, consistency, isolation, durability, sessions, multi-document transactions',
    task: 'Implement task assignment and activity-log creation in a transaction. Test rollback when one operation fails.',
  },
  {
    day: 12,
    topic: 'Concurrency Control',
    concepts: 'Race conditions, atomic updates, optimistic concurrency, version fields, idempotency',
    task: 'Simulate two users updating the same task. Prevent lost updates using conditional updates or version checks.',
  },
  {
    day: 13,
    topic: 'Replication',
    concepts: 'Replica sets, primary, secondary, elections, read preference, write concern, read concern',
    task: 'Set up a local replica-set lab. Understand failover and test different read/write concerns.',
  },
  {
    day: 14,
    topic: 'Sharding and Partitioning',
    concepts: 'Horizontal partitioning, shard keys, cardinality, chunk distribution, hotspots, balancing',
    task: 'Design a sharding strategy for a multi-tenant SaaS application. Compare workspaceId, userId and hashed shard keys.',
  },

  // Phase 2: Node.js and Backend Engineering (Days 15–28)
  {
    day: 15,
    topic: 'Node.js Internals',
    concepts: 'V8 engine, call stack, event loop, libuv, synchronous vs asynchronous execution',
    task: 'Write examples demonstrating event-loop execution order. Explain the output of timers, promises and I/O callbacks.',
  },
  {
    day: 16,
    topic: 'Asynchronous Programming',
    concepts: 'Callbacks, promises, async/await, Promise.all, Promise.allSettled, Promise.race, error propagation',
    task: 'Convert callback-based code to async/await. Process 100 records with controlled concurrency.',
  },
  {
    day: 17,
    topic: 'Streams and Buffers',
    concepts: 'Readable, writable, duplex, transform streams, buffers, piping, backpressure',
    task: 'Create a CSV upload/import endpoint that processes large files without loading the entire file into memory.',
  },
  {
    day: 18,
    topic: 'Process Management',
    concepts: 'Node process lifecycle, process signals, environment variables, graceful shutdown, child processes',
    task: 'Implement graceful shutdown for your Express application. Handle SIGTERM and SIGINT correctly.',
  },
  {
    day: 19,
    topic: 'Memory Management',
    concepts: 'Heap, stack, garbage collection, memory leaks, CPU profiling, heap snapshots',
    task: 'Create a memory leak intentionally. Inspect heap usage and identify and fix the issue.',
  },
  {
    day: 20,
    topic: 'Express Internals',
    concepts: 'Request lifecycle, routing, middleware, next(), error middleware, routers',
    task: 'Refactor an existing Express application into independent routers and middleware.',
  },
  {
    day: 21,
    topic: 'Backend Architecture',
    concepts: 'MVC, layered architecture, controller, service, repository, DTO, separation of concerns',
    task: 'Divide your application into route, controller, service and repository layers.',
  },
  {
    day: 22,
    topic: 'Modular Architecture',
    concepts: 'Modular monolith, clean architecture principles, dependency direction, cohesion, coupling',
    task: 'Organize your backend by business features instead of putting all controllers and models into large folders.',
  },
  {
    day: 23,
    topic: 'Middleware Engineering',
    concepts: 'Authentication middleware, validation middleware, logging middleware, custom middleware, middleware order',
    task: 'Build reusable authentication, request logging, validation and error-handling middleware.',
  },
  {
    day: 24,
    topic: 'Error Handling',
    concepts: 'Centralized error handling, custom errors, operational vs programming errors, async errors',
    task: 'Implement a global error-handling system with consistent API error responses.',
  },
  {
    day: 25,
    topic: 'Validation and Sanitization',
    concepts: 'Zod/Joi/express-validator, schema validation, sanitization, allowlists, mass assignment',
    task: 'Validate every request body and query parameter in your task application.',
  },
  {
    day: 26,
    topic: 'Authentication Fundamentals',
    concepts: 'Authentication vs authorization, password hashing, bcrypt, Argon2, sessions, cookies',
    task: 'Implement secure registration and login with password hashing.',
  },
  {
    day: 27,
    topic: 'JWT Engineering',
    concepts: 'JWT structure, claims, signing, expiry, access tokens, refresh tokens, rotation, revocation',
    task: 'Implement access and refresh tokens with expiry, refresh rotation and logout.',
  },
  {
    day: 28,
    topic: 'Authorization',
    concepts: 'RBAC, permission-based access control, ownership checks, least privilege',
    task: 'Create Admin, Manager and Member roles. Enforce permissions at the backend rather than relying on frontend restrictions.',
  },

  // Phase 3: Advanced React Engineering (Days 29–42)
  {
    day: 29,
    topic: 'React Internals',
    concepts: 'Virtual DOM, reconciliation, Fiber architecture, rendering, diffing, component lifecycle',
    task: 'Create a component tree and use React DevTools to investigate why components re-render.',
  },
  {
    day: 30,
    topic: 'Advanced Hooks I',
    concepts: 'useState, useEffect, useRef, dependency arrays, cleanup functions, stale closures',
    task: 'Build a task dashboard using these hooks. Identify and fix unnecessary effects and stale-state bugs.',
  },
  {
    day: 31,
    topic: 'Advanced Hooks II',
    concepts: 'useMemo, useCallback, useReducer, custom hooks, hook rules',
    task: 'Build a filterable task management interface. Extract reusable custom hooks for filtering and state management.',
  },
  {
    day: 32,
    topic: 'Component Architecture',
    concepts: 'Component composition, controlled and uncontrolled components, compound components, render props, children',
    task: 'Build reusable Modal, Dropdown, Table, Tabs and Button components.',
  },
  {
    day: 33,
    topic: 'State Management',
    concepts: 'Local state, Context API, prop drilling, global state, Redux Toolkit, Zustand',
    task: 'Implement global authentication, theme and user preferences using Redux Toolkit or Zustand.',
  },
  {
    day: 34,
    topic: 'Redux Toolkit Deeply',
    concepts: 'Store, slices, reducers, actions, selectors, createAsyncThunk, middleware',
    task: 'Build a Redux-powered task application with loading, success and failure states.',
  },
  {
    day: 35,
    topic: 'React Rendering Optimization',
    concepts: 'React.memo, memoization, reconciliation, unnecessary renders, React Profiler',
    task: 'Create a dashboard with 1,000+ tasks. Profile and reduce unnecessary component renders.',
  },
  {
    day: 36,
    topic: 'Code Splitting',
    concepts: 'React.lazy, Suspense, dynamic imports, route-based splitting, bundle optimization',
    task: 'Split your dashboard into independently loaded routes. Compare the initial bundle before and after.',
  },
  {
    day: 37,
    topic: 'React Forms',
    concepts: 'React Hook Form, controlled inputs, uncontrolled inputs, form state, validation, Zod integration',
    task: 'Build a multi-step registration form with validation, error messages and conditional fields.',
  },
  {
    day: 38,
    topic: 'React Router',
    concepts: 'BrowserRouter, Routes, nested routes, layouts, loaders, protected routes, error boundaries',
    task: 'Build a role-based dashboard with nested routes and protected pages.',
  },
  {
    day: 39,
    topic: 'API Integration',
    concepts: 'Axios, fetch, interceptors, request cancellation, error handling, retries, loading states',
    task: 'Connect your React application to your Express backend. Implement token-aware API requests and error handling.',
  },
  {
    day: 40,
    topic: 'Server-State Management',
    concepts: 'TanStack Query, useQuery, useMutation, query keys, cache invalidation, optimistic updates',
    task: 'Implement task CRUD using TanStack Query. Add optimistic updates and cache invalidation.',
  },
  {
    day: 41,
    topic: 'Advanced React Architecture',
    concepts: 'Portals, error boundaries, Suspense, accessibility, reusable design systems, environment configuration',
    task: 'Create a reusable frontend component library and refactor your application to use it.',
  },
  {
    day: 42,
    topic: 'React Testing and Production',
    concepts: 'Vitest/Jest, React Testing Library, mocking, component tests, production builds, Lighthouse',
    task: 'Write tests for login, forms and routing. Generate a production build and inspect its performance.',
  },

  // Phase 4: API and Application Engineering (Days 43–49)
  {
    day: 43,
    topic: 'HTTP Fundamentals',
    concepts: 'HTTP/HTTPS, methods, status codes, headers, request/response, safe and idempotent methods',
    task: 'Create an HTTP reference sheet and implement appropriate status codes for 20 API scenarios.',
  },
  {
    day: 44,
    topic: 'REST API Design',
    concepts: 'Resources, endpoint naming, nested resources, filtering, sorting, pagination, response structures',
    task: 'Design REST endpoints for users, workspaces, boards and tasks. Document methods and request/response formats.',
  },
  {
    day: 45,
    topic: 'API Versioning',
    concepts: 'URI versioning, header versioning, backward compatibility, deprecation, API contracts',
    task: 'Implement /api/v1 and design a backward-compatible v2 endpoint.',
  },
  {
    day: 46,
    topic: 'API Validation',
    concepts: 'Request validation, DTOs, sanitization, query validation, serialization, error response standards',
    task: 'Validate all API inputs and implement consistent response formats.',
  },
  {
    day: 47,
    topic: 'API Security',
    concepts: 'CORS, CSRF, authentication, authorization, request-size limits, rate limiting',
    task: 'Secure your API against unauthorized access and invalid requests. Test with Postman.',
  },
  {
    day: 48,
    topic: 'API Documentation',
    concepts: 'OpenAPI, Swagger, endpoint documentation, schemas, examples, API contracts',
    task: 'Generate Swagger documentation for all major endpoints in your project.',
  },
  {
    day: 49,
    topic: 'API Integration & Resilience',
    concepts: 'Frontend-backend integration, interceptors, error mapping, retries, request cancellation',
    task: 'Complete an end-to-end workflow from React UI to Express API to MongoDB. Document all failure cases.',
  },

  // Phase 5: Performance and Scalability (Days 50–56)
  {
    day: 50,
    topic: 'Performance Fundamentals',
    concepts: 'Latency, throughput, response time, p50, p95, p99, CPU, memory, bottlenecks',
    task: 'Benchmark three API endpoints. Record baseline latency and throughput.',
  },
  {
    day: 51,
    topic: 'Caching Strategies',
    concepts: 'Cache-aside, read-through, write-through, write-behind, TTL, cache invalidation',
    task: 'Decide which application data should be cached. Document freshness requirements for each.',
  },
  {
    day: 52,
    topic: 'Redis Fundamentals',
    concepts: 'Redis architecture, strings, hashes, lists, sets, sorted sets, TTL, persistence, eviction',
    task: 'Install Redis locally and build a profile cache and leaderboard.',
  },
  {
    day: 53,
    topic: 'Redis Integration',
    concepts: 'Redis Node.js client, cache keys, serialization, cache misses, TTL management',
    task: 'Integrate Redis into your task dashboard API. Measure cold-cache and warm-cache performance.',
  },
  {
    day: 54,
    topic: 'Cache Consistency',
    concepts: 'Cache invalidation, stale data, cache stampede, distributed locks, TTL jitter',
    task: 'Update a task and ensure its cached dashboard counts and task lists remain consistent.',
  },
  {
    day: 55,
    topic: 'Pagination and Optimization',
    concepts: 'Offset pagination, cursor pagination, stable sorting, projection, batching, compression',
    task: 'Implement cursor-based pagination for a large task collection. Test insertion and deletion during pagination.',
  },
  {
    day: 56,
    topic: 'Load Testing',
    concepts: 'k6, autocannon, virtual users, ramp-up, stress testing, saturation, bottleneck identification',
    task: 'Load-test your application with increasing concurrency. Identify whether MongoDB, Node.js or Redis is the bottleneck.',
  },

  // Phase 6: System Design Foundations (Days 57–63)
  {
    day: 57,
    topic: 'System Design Fundamentals',
    concepts: 'Functional requirements, non-functional requirements, constraints, architecture diagrams, trade-offs',
    task: 'Design a URL shortener. Document requirements, APIs, database schema and architecture.',
  },
  {
    day: 58,
    topic: 'Capacity Estimation',
    concepts: 'QPS, peak traffic, storage estimation, bandwidth, read/write ratio, growth estimation',
    task: 'Estimate infrastructure requirements for 100K, 1M and 10M users. State your assumptions.',
  },
  {
    day: 59,
    topic: 'Monolithic Architecture',
    concepts: 'Monolith, modular monolith, microservices, service boundaries, coupling, cohesion',
    task: 'Design your MERN application as a modular monolith. Identify boundaries between modules.',
  },
  {
    day: 60,
    topic: 'Load Balancing',
    concepts: 'Layer 4, Layer 7, reverse proxy, round robin, least connections, health checks, sticky sessions',
    task: 'Run two Node.js instances behind Nginx. Verify that requests are distributed across both instances.',
  },
  {
    day: 61,
    topic: 'Horizontal Scaling',
    concepts: 'Vertical scaling, horizontal scaling, stateless services, shared sessions, autoscaling',
    task: 'Run multiple API instances and use Redis for shared session/cache data.',
  },
  {
    day: 62,
    topic: 'CDN and Edge Delivery',
    concepts: 'CDN, edge locations, static asset delivery, cache-control, origin servers, invalidation',
    task: 'Configure CDN delivery for your frontend assets. Test cache headers and invalidation.',
  },
  {
    day: 63,
    topic: 'System Design Practice',
    concepts: 'Availability, reliability, latency, scalability, maintainability, cost, architectural trade-offs',
    task: 'Conduct a 30-minute system design exercise for a collaboration application. Draw and explain the architecture.',
  },

  // Phase 7: Distributed Systems and Messaging (Days 64–70)
  {
    day: 64,
    topic: 'Distributed Systems Fundamentals',
    concepts: 'Distributed nodes, network failures, partial failures, timeouts, retries, exponential backoff, jitter',
    task: 'Implement timeout and retry handling for an external API. Simulate failures and inspect retry behaviour.',
  },
  {
    day: 65,
    topic: 'Consistency Models',
    concepts: 'Strong consistency, eventual consistency, CAP theorem, partition tolerance, availability',
    task: 'Decide consistency requirements for authentication, task updates, notifications and analytics.',
  },
  {
    day: 66,
    topic: 'Message Queues',
    concepts: 'Producers, consumers, queues, acknowledgements, delivery guarantees, dead-letter queues',
    task: 'Implement background email and notification processing using BullMQ and Redis.',
  },
  {
    day: 67,
    topic: 'Reliable Processing',
    concepts: 'Idempotent consumers, duplicate delivery, deduplication, retries, poison messages, outbox pattern',
    task: 'Simulate duplicate notification delivery. Ensure the same notification isn\'t processed twice.',
  },
  {
    day: 68,
    topic: 'Event-Driven Architecture',
    concepts: 'Events, commands, publishers, subscribers, pub/sub, domain events, event contracts',
    task: 'Create TaskCreated and TaskAssigned events. Make notification and activity modules consume them independently.',
  },
  {
    day: 69,
    topic: 'WebSockets and Socket.io',
    concepts: 'WebSocket handshake, rooms, namespaces, events, acknowledgements, reconnection, authentication',
    task: 'Implement real-time task updates. Only authorized workspace members should receive board events.',
  },
  {
    day: 70,
    topic: 'Advanced Distributed Architecture',
    concepts: 'API gateways, service discovery, circuit breakers, bulkheads, saga pattern, fault tolerance',
    task: 'Draw a microservices version of your application. Identify failure scenarios and decide which patterns are necessary.',
  },

  // Phase 8: Security Engineering (Days 71–77)
  {
    day: 71,
    topic: 'OWASP and Threat Modelling',
    concepts: 'OWASP Top 10, attack surface, assets, trust boundaries, STRIDE, threat assessment',
    task: 'Threat-model your login, file-upload and task-management APIs. Document possible attacks and mitigations.',
  },
  {
    day: 72,
    topic: 'Injection Attacks',
    concepts: 'SQL injection, NoSQL injection, command injection, parameterization, input allowlists',
    task: 'Test malicious MongoDB query payloads against your APIs. Prevent user-controlled query operators.',
  },
  {
    day: 73,
    topic: 'Browser Security',
    concepts: 'XSS, CSRF, CSP, CORS, SameSite cookies, clickjacking, output encoding',
    task: 'Configure secure browser policies and test your frontend and backend against common attacks.',
  },
  {
    day: 74,
    topic: 'Identity Security',
    concepts: 'Password hashing, bcrypt, Argon2, MFA fundamentals, session security, token leakage, secret rotation',
    task: 'Audit your authentication system. Implement appropriate password and token security controls.',
  },
  {
    day: 75,
    topic: 'API Abuse Protection',
    concepts: 'Rate limiting, brute-force protection, request-size limits, file validation, quotas, abuse detection',
    task: 'Protect login, registration, search and file-upload endpoints. Test excessive requests.',
  },
  {
    day: 76,
    topic: 'Transport and Data Protection',
    concepts: 'HTTPS, TLS, encryption at rest, encryption in transit, PII, data retention, backups',
    task: 'Deploy your application using HTTPS. Identify sensitive fields and document their protection requirements.',
  },
  {
    day: 77,
    topic: 'Security Testing',
    concepts: 'npm audit, dependency scanning, SAST, DAST fundamentals, security regression tests',
    task: 'Run security scans and fix high-priority vulnerabilities. Write tests for authentication and authorization boundaries.',
  },

  // Phase 9: Testing and Quality Engineering (Days 78–84)
  {
    day: 78,
    topic: 'Testing Fundamentals',
    concepts: 'Unit, integration, system, end-to-end testing, test pyramid, test isolation, fixtures',
    task: 'Prepare a testing strategy for your MERN application. Identify critical workflows and their test levels.',
  },
  {
    day: 79,
    topic: 'Backend Unit Testing',
    concepts: 'Jest, Vitest, assertions, mocks, spies, setup, teardown, test coverage',
    task: 'Write unit tests for your backend services, validation functions and permission logic.',
  },
  {
    day: 80,
    topic: 'API Integration Testing',
    concepts: 'Supertest, test database, test fixtures, authentication helpers, cleanup',
    task: 'Test registration, login, task CRUD and role-based access using an isolated test database.',
  },
  {
    day: 81,
    topic: 'Frontend Testing',
    concepts: 'React Testing Library, component rendering, user events, mocking API calls, async testing',
    task: 'Test login, registration, task forms, navigation and error states.',
  },
  {
    day: 82,
    topic: 'End-to-End Testing',
    concepts: 'Playwright, browser contexts, selectors, fixtures, traces, screenshots',
    task: 'Automate the complete workflow: register, create workspace, add members, create tasks and complete tasks.',
  },
  {
    day: 83,
    topic: 'Contract and Regression Testing',
    concepts: 'API contracts, response schemas, backward compatibility, regression testing, flaky tests',
    task: 'Define API response contracts and create tests to catch accidental breaking changes.',
  },
  {
    day: 84,
    topic: 'Code Quality and Tooling',
    concepts: 'ESLint, Prettier, static analysis, complexity, refactoring, code reviews, TDD fundamentals',
    task: 'Configure linting and formatting. Review an existing feature, remove duplication and improve maintainability.',
  },

  // Phase 10: DevOps and Deployment (Days 85–91)
  {
    day: 85,
    topic: 'Linux Fundamentals',
    concepts: 'Filesystem, permissions, processes, ports, signals, shell commands, pipes, grep, find',
    task: 'Use WSL/Linux to inspect running services, permissions, logs and network ports.',
  },
  {
    day: 86,
    topic: 'Advanced Git',
    concepts: 'Branching, merge, rebase, cherry-pick, revert, tags, conflict resolution, pull requests',
    task: 'Practise a complete feature branch workflow. Resolve a deliberate conflict and create a tagged release.',
  },
  {
    day: 87,
    topic: 'Docker Fundamentals',
    concepts: 'Images, containers, layers, Dockerfile, ports, volumes, networks, environment variables',
    task: 'Create a multi-stage Dockerfile for your Node.js application. Build and run the container.',
  },
  {
    day: 88,
    topic: 'Docker Compose',
    concepts: 'Services, networks, persistent volumes, health checks, service dependencies, environment configuration',
    task: 'Containerize your MERN backend, MongoDB and Redis using Docker Compose.',
  },
  {
    day: 89,
    topic: 'Nginx Configuration',
    concepts: 'Reverse proxy, upstream servers, proxy_pass, TLS termination, static hosting, request limits',
    task: 'Configure Nginx to serve your React frontend and route API requests to Express.',
  },
  {
    day: 90,
    topic: 'CI/CD Pipelines',
    concepts: 'Continuous integration, continuous delivery, GitHub Actions, pipeline stages, build, test, deployment, rollback',
    task: 'Create a GitHub Actions workflow that runs linting, tests and production builds on every pull request.',
  },
  {
    day: 91,
    topic: 'Cloud Deployment',
    concepts: 'AWS fundamentals, EC2, S3, IAM, networking, managed databases, environment separation, cost management',
    task: 'Deploy your application. Configure production environment variables, storage and database connectivity.',
  },

  // Phase 11: Observability and Production Operations (Days 92–98)
  {
    day: 92,
    topic: 'Structured Logging',
    concepts: 'Log levels, structured JSON logs, request IDs, correlation IDs, log rotation, PII redaction',
    task: 'Implement structured logging for your backend. Ensure passwords and tokens are never logged.',
  },
  {
    day: 93,
    topic: 'Metrics and Monitoring',
    concepts: 'RED method, USE method, request count, latency, error rate, CPU, memory, dashboards',
    task: 'Collect application metrics and create a dashboard for traffic, latency and errors.',
  },
  {
    day: 94,
    topic: 'Distributed Tracing',
    concepts: 'OpenTelemetry fundamentals, traces, spans, context propagation, trace IDs, bottleneck analysis',
    task: 'Instrument an API request across Node.js, MongoDB and a background worker. Find where execution time is spent.',
  },
  {
    day: 95,
    topic: 'Reliability Engineering',
    concepts: 'SLI, SLO, SLA, error budgets, uptime, graceful degradation, readiness and liveness probes',
    task: 'Define measurable reliability objectives for your application and implement health-check endpoints.',
  },
  {
    day: 96,
    topic: 'Incident Management',
    concepts: 'Incident detection, severity, alerting, mitigation, rollback, runbooks, postmortems',
    task: 'Simulate a database outage. Investigate the issue, restore service and write a blameless postmortem.',
  },
  {
    day: 97,
    topic: 'Disaster Recovery',
    concepts: 'Database backup, restore, replication, RPO, RTO, point-in-time recovery, failover',
    task: 'Create a database backup and restore it into a separate environment. Verify the restored data.',
  },
  {
    day: 98,
    topic: 'Production Readiness Review',
    concepts: 'Security, capacity, observability, performance, reliability, deployment, rollback, documentation',
    task: 'Conduct a production-readiness review. Identify and fix the five highest-priority risks.',
  },

  // Phase 12: Advanced Data and Architecture Patterns (Days 99–105)
  {
    day: 99,
    topic: 'Database Migrations',
    concepts: 'Schema migrations, backward-compatible changes, expand-and-contract, rollback, seed data',
    task: 'Add a new field to an existing database without breaking the currently deployed application version.',
  },
  {
    day: 100,
    topic: 'Search Engineering',
    concepts: 'MongoDB text search, text indexes, autocomplete, relevance, filters, dedicated search engines, Elasticsearch fundamentals',
    task: 'Implement task search with text queries, filters and sorting. Identify when a dedicated search engine might be needed.',
  },
  {
    day: 101,
    topic: 'File Storage Engineering',
    concepts: 'Object storage, Amazon S3, metadata, presigned URLs, multipart uploads, file validation, retention',
    task: 'Implement file uploads using object storage. Store file metadata separately in MongoDB.',
  },
  {
    day: 102,
    topic: 'Multi-Tenancy Architecture',
    concepts: 'Tenant isolation, tenant-aware queries, shared databases, isolated databases, tenant context, authorization',
    task: 'Convert your application into a multi-tenant application. Ensure users cannot access another workspace\'s information.',
  },
  {
    day: 103,
    topic: 'API Gateway & Service Boundaries',
    concepts: 'Gateway routing, authentication delegation, rate limiting, service contracts, service ownership',
    task: 'Design an API gateway architecture for your application. Document the responsibilities of each module/service.',
  },
  {
    day: 104,
    topic: 'Advanced Architecture Patterns',
    concepts: 'CQRS, event sourcing, read models, command models, saga, outbox, eventual consistency',
    task: 'Design a task workflow using normal CRUD and compare it with a CQRS/event-driven approach.',
  },
  {
    day: 105,
    topic: 'Architecture Decision Records (ADRs)',
    concepts: 'ADRs, architectural trade-offs, decision documentation, rejected alternatives, technical debt',
    task: 'Write three ADRs covering your database design, caching strategy and backend architecture.',
  },

  // Phase 13: AI API and Token Engineering (Days 106–112)
  {
    day: 106,
    topic: 'Token Fundamentals',
    concepts: 'Tokens vs characters, tokenization, input tokens, output tokens, context windows, tokenizer tools, model limits',
    task: 'Use a tokenizer to calculate the token usage of short, medium and large prompts.',
  },
  {
    day: 107,
    topic: 'Prompt Optimization',
    concepts: 'Prompt structure, system instructions, context selection, structured output, prompt length, prompt caching',
    task: 'Take a lengthy prompt and optimize it while maintaining the same output quality. Compare token usage.',
  },
  {
    day: 108,
    topic: 'LLM API Cost Management',
    concepts: 'Input/output pricing, model selection, max output tokens, temperature, usage budgets, per-user quotas',
    task: 'Build an AI endpoint that tracks token consumption and estimates the cost of each request.',
  },
  {
    day: 109,
    topic: 'Rate Limits and Concurrency',
    concepts: 'Requests per minute, tokens per minute, HTTP 429, exponential backoff, concurrency limits, queueing',
    task: 'Simulate API rate limits. Implement bounded retries and request queuing without duplicate processing.',
  },
  {
    day: 110,
    topic: 'RAG Fundamentals',
    concepts: 'Embeddings, vector databases, chunking, overlap, similarity search, metadata filtering, retrieval',
    task: 'Build a document question-answering feature using your own study notes.',
  },
  {
    day: 111,
    topic: 'RAG Optimization',
    concepts: 'Top-k retrieval, reranking, context assembly, relevance evaluation, citations, latency and cost trade-offs',
    task: 'Test 10 questions against your document collection. Record retrieval quality, latency and token usage.',
  },
  {
    day: 112,
    topic: 'AI Production Engineering',
    concepts: 'Prompt injection, guardrails, privacy, moderation, caching, fallbacks, observability, evaluation',
    task: 'Add AI-specific security, usage limits, monitoring and failure handling to your AI endpoint.',
  },

  // Phase 14: Production-Grade MERN Capstone (Days 113–119)
  {
    day: 113,
    topic: 'Project Planning and Requirements',
    concepts: 'Functional requirements, non-functional requirements, user stories, acceptance criteria, architecture, estimation',
    task: 'Finalize your capstone scope. Prepare user stories, system architecture, database design and API contracts.',
  },
  {
    day: 114,
    topic: 'Database Implementation',
    concepts: 'MongoDB schemas, relationships, indexes, validation, aggregation, transactions, seed scripts',
    task: 'Implement the complete database. Add realistic sample data and verify query execution plans.',
  },
  {
    day: 115,
    topic: 'Backend Implementation',
    concepts: 'Express architecture, controllers, services, repositories, JWT, RBAC, validation, centralized errors',
    task: 'Implement core backend modules with secure authentication, role-based access and proper error handling.',
  },
  {
    day: 116,
    topic: 'React Frontend Implementation',
    concepts: 'Feature-based architecture, reusable components, Redux/Zustand, React Router, TanStack Query, forms',
    task: 'Build the frontend and integrate all core APIs. Implement authentication, dashboards and role-specific interfaces.',
  },
  {
    day: 117,
    topic: 'Performance Engineering',
    concepts: 'Redis, caching, cursor pagination, query optimization, load testing, cache invalidation',
    task: 'Add caching and pagination. Benchmark important APIs before and after optimization.',
  },
  {
    day: 118,
    topic: 'Real-Time and Background Processing',
    concepts: 'Socket.io, queues, workers, retries, dead-letter queues, event-driven architecture, authorization',
    task: 'Implement real-time updates and background notifications. Prevent duplicate jobs and unauthorized event delivery.',
  },
  {
    day: 119,
    topic: 'Deployment and Production',
    concepts: 'Docker, Docker Compose, Nginx, CI/CD, HTTPS, structured logging, monitoring, backup, restore',
    task: 'Deploy the complete application. Configure automated tests, monitoring and a tested backup/restore process.',
  },

  // Phase 15: Engineering Audit and SDE Preparation (Days 120–126)
  {
    day: 120,
    topic: 'Database Engineering Revision',
    concepts: 'Schema design, normalization, denormalization, indexing, transactions, aggregation, replication, sharding',
    task: 'Take three application scenarios and design their databases. Explain your schema and index decisions aloud.',
  },
  {
    day: 121,
    topic: 'Backend Engineering Revision',
    concepts: 'Node.js internals, Express, REST, authentication, authorization, queues, caching, error handling',
    task: 'Design and implement a small backend API. Explain the architecture, security decisions and failure handling.',
  },
  {
    day: 122,
    topic: 'React Engineering Revision',
    concepts: 'Hooks, state management, rendering, memoization, routing, API integration, server state, component testing',
    task: 'Build a small React dashboard with authentication, API integration and optimized rendering.',
  },
  {
    day: 123,
    topic: 'System Design Practice I',
    concepts: 'URL shortener, rate limiter, notification service, capacity estimation, caching, database selection',
    task: 'Complete one 45-minute system design exercise. Draw the architecture and justify your choices.',
  },
  {
    day: 124,
    topic: 'System Design Practice II',
    concepts: 'Chat system, file storage, activity feed, real-time collaboration, WebSockets, scaling, consistency',
    task: 'Design a collaborative application. Explain real-time delivery, message ordering and horizontal scaling.',
  },
  {
    day: 125,
    topic: 'Debugging and Performance Drill',
    concepts: 'Logs, metrics, traces, CPU profiling, memory leaks, query plans, load testing, incident response',
    task: 'Introduce a performance issue into your capstone. Diagnose it using evidence, fix it and record the improvement.',
  },
  {
    day: 126,
    topic: 'Final Engineering Audit',
    concepts: 'Security, testing, deployment, reliability, maintainability, documentation, ADRs, technical communication',
    task: 'Audit your complete project. Fix critical issues, update documentation, prepare an architecture diagram and deliver a 5–10 minute technical presentation.',
  },
];

export const advancedSpecCurriculum = {
  roadmapSlug: 'advanced-engineering-specialization',
  modules: advancedPhases.map((p, idx) => ({
    title: p.title,
    description: p.goal,
    startingDay: p.startingDay,
    endingDay: p.endingDay,
    displayOrder: idx + 1,
  })),
  days: advancedDayRows.map((d) => {
    const phaseIdx = advancedPhases.findIndex((p) => d.day >= p.startingDay && d.day <= p.endingDay);
    const phase = advancedPhases[phaseIdx];

    return {
      dayNumber: d.day,
      moduleIndex: phaseIdx,
      title: `Day ${d.day}: ${d.topic}`,
      objective: d.concepts,
      estimatedStudyTime: 90,
      dayType: d.day % 7 === 0 ? 'project' : d.day % 3 === 0 ? 'practice' : 'learning',
      tasks: [
        {
          title: `Concept Breakdown: ${d.topic}`,
          description: `Master core topics: ${d.concepts}.`,
          taskType: 'learn',
          estimatedDuration: 30,
          displayOrder: 1,
        },
        {
          title: d.task,
          description: `Practical engineering task: ${d.task}`,
          taskType: d.day % 7 === 0 ? 'project' : 'code',
          estimatedDuration: 40,
          displayOrder: 2,
        },
        {
          title: `Architecture Review & Key Takeaways: ${d.topic}`,
          description: `Document architecture decisions, analyze trade-offs, and verify edge-cases for ${d.topic}.`,
          taskType: 'practice',
          estimatedDuration: 20,
          displayOrder: 3,
        },
      ],
    };
  }),
};
