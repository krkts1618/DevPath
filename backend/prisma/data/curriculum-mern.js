// Generator for MERN Stack Maintenance (56 Days, 8 Modules)

const mernModules = [
  {
    title: 'Module 1: React Fundamentals & Component Architecture',
    description: 'Deep revision of component composition, state & props, controlled inputs, custom hooks, and URL-synchronized tables.',
    startingDay: 1,
    endingDay: 7,
    displayOrder: 1,
  },
  {
    title: 'Module 2: Advanced React Patterns & UI State Management',
    description: 'Mastering memoization hooks, Context API, useReducer, protected routing, optimistic UI, and accessible dialogs.',
    startingDay: 8,
    endingDay: 14,
    displayOrder: 2,
  },
  {
    title: 'Module 3: Node.js & Production-Grade Express Engineering',
    description: 'Event loop architecture, modular routing, centralized error handlers, validation, rate limiting, and request logging.',
    startingDay: 15,
    endingDay: 21,
    displayOrder: 3,
  },
  {
    title: 'Module 4: MongoDB & Mongoose Schema Engineering',
    description: 'Document modeling, embedding vs referencing, aggregation pipelines, compound indexes, explain plans, and transactions.',
    startingDay: 22,
    endingDay: 28,
    displayOrder: 4,
  },
  {
    title: 'Module 5: Authentication, Security & Role-Based Authorization',
    description: 'Secure registration, password hashing (BCrypt), JWT access/refresh token rotation, RBAC, ownership checks, and CORS.',
    startingDay: 29,
    endingDay: 35,
    displayOrder: 5,
  },
  {
    title: 'Module 6: Full-Stack Project: Personal Knowledge Capture App',
    description: 'End-to-end development of a knowledge snippet capture app with tags, search, filtering, auth, and automated testing.',
    startingDay: 36,
    endingDay: 42,
    displayOrder: 6,
  },
  {
    title: 'Module 7: Automated Testing, Profiling & CI Workflows',
    description: 'Unit testing with Jest/Vitest, React Testing Library, Supertest route testing, React DevTools profiling, and GitHub Actions.',
    startingDay: 43,
    endingDay: 49,
    displayOrder: 7,
  },
  {
    title: 'Module 8: Docker Containerization & Cloud Deployment',
    description: 'Multi-stage Dockerfiles, Docker Compose multi-service orchestration, volumes, health checks, cloud deployment, and README.',
    startingDay: 50,
    endingDay: 56,
    displayOrder: 8,
  },
];

const dayDefinitions = [
  // Module 1: Days 1-7
  {
    dayNumber: 1,
    moduleIndex: 0,
    title: 'Component Composition, Props & State Immutability',
    objective: 'Revise React component composition, props vs state immutability, and build a composite profile card.',
    tasks: [
      { title: 'Revise React component composition and children prop', desc: 'Compose flexible layout cards utilizing props.children and modular subcomponents.', type: 'learn', dur: 25 },
      { title: 'Practice state updates and immutability rules', desc: 'Implement immutability patterns using spread operators for nested objects and arrays.', type: 'code', dur: 25 },
      { title: 'Build a composite ProfileCard with avatar, badge & action buttons', desc: 'Construct a reusable component accepting dynamic props and callback actions.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 2,
    moduleIndex: 0,
    title: 'Conditional Rendering & List Keys Mechanics',
    objective: 'Master short-circuit evaluation, ternary rendering, and diagnose bugs caused by unstable array index keys.',
    tasks: [
      { title: 'Master conditional rendering patterns (&&, ternary, early return)', desc: 'Prevent rendering bugs like 0 being printed on falsy array length evaluations.', type: 'learn', dur: 25 },
      { title: 'Analyze React reconciliation and key prop requirements', desc: 'Demonstrate why array indexes cause input state bugs when reordering lists.', type: 'code', dur: 25 },
      { title: 'Build an interactive checklist with filterable render views', desc: 'Create active, completed, and all task view tabs with smooth transitions.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 3,
    moduleIndex: 0,
    title: 'Controlled Inputs, Form State & Validation',
    objective: 'Build multi-input controlled forms with single-state objects and synchronous error validation.',
    tasks: [
      { title: 'Compare controlled components with uncontrolled inputs (useRef)', desc: 'Analyze single source of truth benefits versus uncontrolled DOM performance.', type: 'learn', dur: 25 },
      { title: 'Implement dynamic multi-input form handler in React', desc: 'Handle multiple form inputs cleanly using [e.target.name]: e.target.value syntax.', type: 'code', dur: 25 },
      { title: 'Add real-time form validation and inline error rendering', desc: 'Validate email, password length, and required fields with disabled submit states.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 4,
    moduleIndex: 0,
    title: 'useState Batching & useEffect Dependency Lifecycle',
    objective: 'Master state batching, useEffect dependency rules, and write cleanup functions to prevent memory leaks.',
    tasks: [
      { title: 'Study automatic batching in React 18', desc: 'Understand how React batches state updates inside promises, timeouts, and event handlers.', type: 'learn', dur: 25 },
      { title: 'Master useEffect dependency array rules and stale closures', desc: 'Avoid infinite loops, fix missing dependencies, and identify stale state traps.', type: 'code', dur: 25 },
      { title: 'Implement cleanup function to abort fetch and clear timers', desc: 'Use AbortController inside useEffect to cancel in-flight network requests on unmount.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 5,
    moduleIndex: 0,
    title: 'Searchable & Sortable Data Table with API Fetching',
    objective: 'Fetch remote data, manage loading/error/data states, and build client-side column sorting and text search.',
    tasks: [
      { title: 'Implement 3-state data fetching (loading, error, data)', desc: 'Handle pending UI skeletons, error banners, and populated data views.', type: 'code', dur: 25 },
      { title: 'Build column sorting logic for numeric and string data', desc: 'Toggle ascending, descending, and neutral sort states per table header.', type: 'code', dur: 25 },
      { title: 'Implement client-side case-insensitive text search filtering', desc: 'Filter tabular data across multiple fields in real-time as user types.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 6,
    moduleIndex: 0,
    title: 'Custom Fetching Hook & URL-Synchronized Pagination',
    objective: 'Extract reusable useFetch hook and synchronize page number and filter state with URL query parameters.',
    tasks: [
      { title: 'Build a reusable custom useFetch(url, options) hook', desc: 'Encapsulate data, loading, error states, and automatic abort controller in a custom hook.', type: 'code', dur: 25 },
      { title: 'Implement pagination logic with Next/Prev and page numbers', desc: 'Calculate total pages, slice current page records, and disable boundary buttons.', type: 'code', dur: 25 },
      { title: 'Sync pagination & filters with URL search params (useSearchParams)', desc: 'Ensure refreshing the browser or sharing URL preserves active page and search query.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 7,
    moduleIndex: 0,
    title: 'Persistent Theme Toggle & Module 1 Review Project',
    objective: 'Implement dark/light mode with localStorage persistence and build a consolidated User Directory Mini-App.',
    tasks: [
      { title: 'Implement theme switcher with localStorage persistence', desc: 'Toggle dark class on document root and persist preference across sessions.', type: 'code', dur: 20 },
      { title: 'Module 1 Project: Build User Directory Mini-App', desc: 'Combine custom useFetch, sortable table, search, pagination, and persistent theme.', type: 'project', dur: 35 },
      { title: 'Document React fundamentals best practices', desc: 'Summarize state immutability, effect cleanups, and key prop rules in notes.', type: 'revise', dur: 20 },
    ],
  },

  // Module 2: Days 8-14
  {
    dayNumber: 8,
    moduleIndex: 1,
    title: 'Performance Optimization: useMemo, useCallback & React.memo',
    objective: 'Prevent redundant component re-renders using useMemo, useCallback, and React.memo.',
    tasks: [
      { title: 'Study React Fiber reconciliation and re-render triggers', desc: 'Understand why child components re-render when parent state updates.', type: 'learn', dur: 25 },
      { title: 'Implement useMemo for expensive data filtering calculations', desc: 'Benchmark computation time with and without useMemo on 5,000 mock items.', type: 'code', dur: 25 },
      { title: 'Stabilize callback functions with useCallback and React.memo', desc: 'Wrap child components in React.memo and pass stable callbacks to prevent render cascades.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 9,
    moduleIndex: 1,
    title: 'useRef for DOM Access & Mutable Instance Variables',
    objective: 'Utilize useRef for direct DOM manipulation, focus management, and retaining timer references without re-renders.',
    tasks: [
      { title: 'Study useRef mechanics vs useState re-rendering', desc: 'Learn why mutating ref.current does not trigger component reconciliation.', type: 'learn', dur: 25 },
      { title: 'Implement auto-focus on input mount and custom audio controller', desc: 'Access underlying DOM elements directly using React ref attributes.', type: 'code', dur: 25 },
      { title: 'Build a Stopwatch with Start, Pause, and Reset using useRef', desc: 'Store interval ID in useRef and prevent memory leaks on component unmount.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 10,
    moduleIndex: 1,
    title: 'Context API: Global State & Prop Drilling Elimination',
    objective: 'Create modular React contexts for authentication and theme, avoiding unnecessary consumer re-renders.',
    tasks: [
      { title: 'Architect React Context API with custom provider components', desc: 'Create ThemeContext and AuthContext with encapsulated helper methods.', type: 'code', dur: 25 },
      { title: 'Create custom useTheme and useAuth consumer hooks', desc: 'Throw descriptive errors when hooks are consumed outside their providers.', type: 'code', dur: 25 },
      { title: 'Optimize context re-renders by splitting state and dispatch', desc: 'Prevent components that only trigger actions from re-rendering on data updates.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 11,
    moduleIndex: 1,
    title: 'Complex State Management with useReducer Hook',
    objective: 'Implement pure state reducers, typed actions, and manage multi-step checkout / cart state.',
    tasks: [
      { title: 'Study Reducer pattern and pure state transitions', desc: 'Understand (state, action) => newState contract and predictable state machines.', type: 'learn', dur: 25 },
      { title: 'Build shopping cart / multi-item state using useReducer', desc: 'Support ADD_ITEM, REMOVE_ITEM, UPDATE_QTY, and CLEAR_CART actions.', type: 'code', dur: 25 },
      { title: 'Combine useReducer with Context API for scalable state', desc: 'Provide state and dispatch down component tree without prop drilling.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 12,
    moduleIndex: 1,
    title: 'React Router v6: Nested Routes & Layout Sharing',
    objective: 'Configure React Router v6, implement shared layout routes via Outlet, and dynamic path parameters.',
    tasks: [
      { title: 'Configure BrowserRouter, Routes, and Route in React Router v6', desc: 'Set up top-level routing with navigation links and active link styles.', type: 'code', dur: 25 },
      { title: 'Implement shared layout with header, sidebar & <Outlet />', desc: 'Nest child routes inside an AppLayout wrapper to share persistent UI frames.', type: 'code', dur: 25 },
      { title: 'Extract path parameters using useParams and programmatic useNavigate', desc: 'Route to /items/:id and redirect users programmatically upon form submission.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 13,
    moduleIndex: 1,
    title: 'Protected Routes & Authentication Guards',
    objective: 'Implement an AuthGuard route wrapper, redirect unauthenticated users, and preserve intended location.',
    tasks: [
      { title: 'Build a ProtectedRoute component checking auth state', desc: 'Conditionally render <Outlet /> or redirect to /login using <Navigate />.', type: 'code', dur: 25 },
      { title: 'Preserve user intended route location via location state', desc: 'Redirect back to original page after successful simulated authentication.', type: 'code', dur: 25 },
      { title: 'Implement role-based route guards (Admin vs User)', desc: 'Restrict /admin dashboard routes based on user role attribute.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 14,
    moduleIndex: 1,
    title: 'Debounced Search, Optimistic UI & Accessible Modal',
    objective: 'Build debounced input searching, implement optimistic UI state updates, and construct an accessible modal.',
    tasks: [
      { title: 'Implement custom useDebounce hook for search inputs', desc: 'Delay expensive API searches by 400ms until user stops typing.', type: 'code', dur: 25 },
      { title: 'Implement Optimistic UI updates with rollback on failure', desc: 'Immediately update UI like/toggle state, reverting if API call fails.', type: 'code', dur: 25 },
      { title: 'Build an accessible modal dialog with backdrop & Escape key', desc: 'Trap focus, lock background scrolling, and listen for Escape key press to dismiss.', type: 'project', dur: 25 },
    ],
  },

  // Module 3: Days 15-21: Node.js & Express
  {
    dayNumber: 15,
    moduleIndex: 2,
    title: 'Node.js Runtime Architecture & Event Loop Phases',
    objective: 'Understand V8 engine, Libuv thread pool, event loop phases, and asynchronous non-blocking I/O.',
    tasks: [
      { title: 'Study Node.js architecture: V8, Libuv & C++ bindings', desc: 'Understand single-threaded JavaScript execution backed by multi-threaded OS pool.', type: 'learn', dur: 25 },
      { title: 'Trace Event Loop phases: Timers, Poll, Check, Close', desc: 'Predict console output order for setTimeout, setImmediate, and process.nextTick.', type: 'code', dur: 25 },
      { title: 'Write non-blocking asynchronous file operations (fs/promises)', desc: 'Read and write JSON files asynchronously without blocking main thread.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 16,
    moduleIndex: 2,
    title: 'Express Setup, Modular Routing & Request Lifecycle',
    objective: 'Initialize Express application, configure environment variables, and create modular route handlers.',
    tasks: [
      { title: 'Configure Express with ES modules and dotenv', desc: 'Structure src directory: controllers, routes, middlewares, services, config.', type: 'code', dur: 25 },
      { title: 'Create modular Router instances for resources', desc: 'Mount resource routers under /api/v1 prefixes cleanly.', type: 'code', dur: 25 },
      { title: 'Trace Express middleware execution pipeline and next() chaining', desc: 'Inspect request object flow through chained middleware functions.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 17,
    moduleIndex: 2,
    title: 'Express Built-in & Custom Middlewares',
    objective: 'Implement custom application middlewares, parse bodies, handle CORS, and inject correlation IDs.',
    tasks: [
      { title: 'Configure express.json(), express.urlencoded(), and cors', desc: 'Set payload size limits and whitelist authorized origin domains.', type: 'code', dur: 25 },
      { title: 'Build a Request ID & Correlation ID middleware', desc: 'Generate unique X-Request-ID (UUID) for tracing requests across logs.', type: 'code', dur: 25 },
      { title: 'Build a structured HTTP request logging middleware', desc: 'Log timestamp, HTTP method, path, response status, and duration in ms.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 18,
    moduleIndex: 2,
    title: 'Centralized Error Handling & Custom AppError Classes',
    objective: 'Implement centralized error middleware, async handler wrapper, and standardized JSON error payloads.',
    tasks: [
      { title: 'Create custom AppError class with operational status codes', desc: 'Capture stack trace and define operational vs programming error flags.', type: 'code', dur: 25 },
      { title: 'Implement asyncHandler wrapper to catch rejected promises', desc: 'Eliminate repetitive try-catch blocks in Express route controller functions.', type: 'code', dur: 25 },
      { title: 'Write centralized Express error handling middleware (err, req, res, next)', desc: 'Format consistent error responses and mask internal database secrets.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 19,
    moduleIndex: 2,
    title: 'Request Validation & Sanitization with Zod',
    objective: 'Validate request bodies, query params, and route parameters with Zod schema middleware.',
    tasks: [
      { title: 'Define Zod schemas for incoming resource payloads', desc: 'Enforce type validation, string length limits, email formats, and required fields.', type: 'code', dur: 25 },
      { title: 'Build generic validate(schema, source) Express middleware', desc: 'Intercept invalid requests with descriptive 422 Unprocessable Entity details.', type: 'code', dur: 25 },
      { title: 'Sanitize user inputs to prevent NoSQL and HTML injection', desc: 'Trim strings, strip dangerous prototype keys, and sanitize special characters.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 20,
    moduleIndex: 2,
    title: 'API Query Features: Filtering, Sorting, Field Selection & Pagination',
    objective: 'Implement production-grade query parser for pagination, sorting by fields, and range filtering.',
    tasks: [
      { title: 'Implement limit and page offset pagination helper', desc: 'Calculate skip, take, and return total count, page count, and hasNextPage metadata.', type: 'code', dur: 25 },
      { title: 'Implement dynamic field sorting (?sort=-createdAt,price)', desc: 'Parse comma-separated sort strings into database-compatible order objects.', type: 'code', dur: 25 },
      { title: 'Implement field filtering and field limiting (?fields=name,price)', desc: 'Filter by comparison operators (gte, lte) and project only requested fields.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 21,
    moduleIndex: 2,
    title: 'API Rate Limiting & Security Headers',
    objective: 'Protect Express API with express-rate-limit, helmet security headers, and health endpoint.',
    tasks: [
      { title: 'Configure express-rate-limit on sensitive auth endpoints', desc: 'Restrict login endpoints to 5 attempts per 15 minutes to prevent brute-force attacks.', type: 'code', dur: 25 },
      { title: 'Apply Helmet middleware for HTTP security headers', desc: 'Configure Content-Security-Policy, X-Frame-Options, and X-Content-Type-Options.', type: 'code', dur: 25 },
      { title: 'Build /api/health endpoint reporting system uptime & memory usage', desc: 'Return process uptime, memory usage, and environment status in JSON.', type: 'practice', dur: 25 },
    ],
  },

  // Module 4: Days 22-28: MongoDB & Mongoose
  {
    dayNumber: 22,
    moduleIndex: 3,
    title: 'MongoDB Architecture & Mongoose Schema Design',
    objective: 'Model documents and collections, compare BSON vs JSON, and design schemas with validation.',
    tasks: [
      { title: 'Study MongoDB document model: BSON data types & ObjectId', desc: 'Understand document storage, collections, and 16MB document size limit.', type: 'learn', dur: 25 },
      { title: 'Connect Mongoose with connection pool options', desc: 'Configure autoIndex, maxPoolSize, serverSelectionTimeoutMS, and event listeners.', type: 'code', dur: 25 },
      { title: 'Define Mongoose schema with custom validators and timestamps', desc: 'Create schema with trim, lowercase, enum, min, max, and custom regex validator.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 23,
    moduleIndex: 3,
    title: 'Embedding vs Referencing & Schema Relationships',
    objective: 'Analyze embedding vs referencing trade-offs and implement 1:1, 1:N, and N:M data models.',
    tasks: [
      { title: 'Analyze Embedding vs Referencing design criteria', desc: 'Evaluate document growth, atomicity requirements, and query access patterns.', type: 'learn', dur: 25 },
      { title: 'Model embedded subdocuments with subdocument schemas', desc: 'Embed address or items arrays inside order documents with automatic validation.', type: 'code', dur: 25 },
      { title: 'Model referenced relationships and Mongoose populate()', desc: 'Reference ObjectId from related models and populate selected fields.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 24,
    moduleIndex: 3,
    title: 'Mongoose CRUD Operations & Query Operators',
    objective: 'Execute advanced CRUD operations using comparison, logical, and element query operators.',
    tasks: [
      { title: 'Execute create(), find(), findById(), updateOne(), deleteOne()', desc: 'Perform standard CRUD operations handling null results gracefully.', type: 'code', dur: 25 },
      { title: 'Use comparison & logical operators ($in, $nin, $and, $or, $regex)', desc: 'Query documents with complex multi-condition boolean filters.', type: 'code', dur: 25 },
      { title: 'Perform atomic updates with $set, $inc, $push, $pull, and $addToSet', desc: 'Update array fields and counter fields atomically without fetching document first.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 25,
    moduleIndex: 3,
    title: 'Mongoose Middleware (Hooks) & Virtual Attributes',
    objective: 'Implement pre/post save hooks, query hooks, and computed virtual properties.',
    tasks: [
      { title: 'Create pre-save hooks for password hashing and slug generation', desc: 'Automatically slugify title before document persistence.', type: 'code', dur: 25 },
      { title: 'Implement query middleware to exclude soft-deleted records', desc: 'Filter out isDeleted: true records automatically in find() queries.', type: 'code', dur: 25 },
      { title: 'Define Mongoose virtual properties and getter/setter formatting', desc: 'Calculate fullName from firstName + lastName and include virtuals in JSON output.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 26,
    moduleIndex: 3,
    title: 'MongoDB Aggregation Pipeline: Match, Group & Project',
    objective: 'Construct multi-stage aggregation pipelines for analytics and summary statistics.',
    tasks: [
      { title: 'Master pipeline stages: $match, $group, $project, $sort', desc: 'Filter documents early, group by category, and project computed fields.', type: 'code', dur: 25 },
      { title: 'Use accumulators: $sum, $avg, $min, $max, $push', desc: 'Calculate total revenue, average order value, and collect unique tag lists.', type: 'code', dur: 25 },
      { title: 'Perform multi-stage analytics pipeline with pagination ($facet)', desc: 'Calculate total count and paginated items in a single aggregation execution.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 27,
    moduleIndex: 3,
    title: 'MongoDB Indexes & Query Execution Plans (explain)',
    objective: 'Create single-field, compound, and TTL indexes and analyze query execution using explain().',
    tasks: [
      { title: 'Create compound indexes adhering to ESR (Equality, Sort, Range) rule', desc: 'Optimize query performance for simultaneous equality filters, sorts, and range conditions.', type: 'code', dur: 25 },
      { title: 'Analyze execution stats with explain("executionStats")', desc: 'Inspect IXSCAN vs COLLSCAN, totalDocsExamined, and nReturned metrics.', type: 'code', dur: 25 },
      { title: 'Create TTL (Time To Live) index for expiring sessions/cache', desc: 'Configure index on createdAt with expireAfterSeconds for auto-purge.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 28,
    moduleIndex: 3,
    title: 'MongoDB Multi-Document ACID Transactions',
    objective: 'Implement multi-document transactions using replica set sessions and rollback on failure.',
    tasks: [
      { title: 'Study MongoDB ACID transactions and session lifecycle', desc: 'Learn session.startTransaction(), commitTransaction(), and abortTransaction().', type: 'learn', dur: 25 },
      { title: 'Execute multi-document transfer transaction across two accounts', desc: 'Debit source account and credit destination account inside an atomic session.', type: 'code', dur: 25 },
      { title: 'Test transaction rollback handling error midway', desc: 'Simulate network failure and verify zero partial state changes occur.', type: 'practice', dur: 25 },
    ],
  },

  // Module 5: Days 29-35: Authentication & Security
  {
    dayNumber: 29,
    moduleIndex: 4,
    title: 'User Registration & Password Hashing with BCrypt',
    objective: 'Build registration endpoint with email uniqueness check, password hashing, and salt rounds.',
    tasks: [
      { title: 'Study password security, salting, and BCrypt algorithm', desc: 'Understand why plain text and MD5/SHA1 are insecure for password storage.', type: 'learn', dur: 25 },
      { title: 'Hash user passwords with bcrypt.hash(password, 12)', desc: 'Store hashed password and ensure raw passwords are never returned in responses.', type: 'code', dur: 25 },
      { title: 'Build user registration API endpoint with Zod validation', desc: 'Validate input, create user record, and return standardized success message.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 30,
    moduleIndex: 4,
    title: 'User Login & JSON Web Token (JWT) Generation',
    objective: 'Authenticate user credentials with bcrypt.compare() and issue signed JWT access tokens.',
    tasks: [
      { title: 'Verify user credentials with bcrypt.compare()', desc: 'Check password match and return generic Invalid credentials on failure.', type: 'code', dur: 25 },
      { title: 'Sign JWT access token with payload, secret & 15m expiration', desc: 'Include userId, email, and role in token payload; sign using jsonwebtoken.', type: 'code', dur: 25 },
      { title: 'Return secure HTTP-only cookies vs authorization bearer header', desc: 'Evaluate security trade-offs of localStorage vs httpOnly secure cookies.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 31,
    moduleIndex: 4,
    title: 'JWT Authentication Middleware & Route Protection',
    objective: 'Implement authenticate Express middleware to verify Bearer token and attach req.user.',
    tasks: [
      { title: 'Extract Bearer token from authorization header', desc: 'Parse header and throw 401 Unauthorized if token is missing or malformed.', type: 'code', dur: 25 },
      { title: 'Verify token signature and expiration with jwt.verify()', desc: 'Handle TokenExpiredError and JsonWebTokenError with clear client messages.', type: 'code', dur: 25 },
      { title: 'Fetch authenticated user and attach to req.user object', desc: 'Verify user still exists in database and attach user data for downstream handlers.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 32,
    moduleIndex: 4,
    title: 'Refresh Token Rotation & Session Invalidation',
    objective: 'Implement short-lived access tokens, long-lived refresh tokens, and token rotation on logout.',
    tasks: [
      { title: 'Architect Refresh Token rotation system', desc: 'Store hashed refresh tokens in database with device/IP tracking.', type: 'learn', dur: 25 },
      { title: 'Build /api/auth/refresh endpoint to issue fresh access token', desc: 'Validate refresh token, generate new access token, and rotate refresh token.', type: 'code', dur: 25 },
      { title: 'Implement user logout endpoint invalidating active refresh token', desc: 'Delete refresh token from database and clear client cookies.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 33,
    moduleIndex: 4,
    title: 'Role-Based Access Control (RBAC)',
    objective: 'Implement authorize(...roles) middleware restricting endpoints to specific user roles.',
    tasks: [
      { title: 'Define user roles: user, editor, moderator, admin', desc: 'Store role on user schema with default role = user.', type: 'code', dur: 25 },
      { title: 'Build authorize(...roles) middleware checking req.user.role', desc: 'Throw 403 Forbidden with descriptive message if role is unauthorized.', type: 'code', dur: 25 },
      { title: 'Test protected admin routes with non-admin and admin tokens', desc: 'Verify 403 response for regular user and 200 response for admin.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 34,
    moduleIndex: 4,
    title: 'Resource Ownership Authorization & Multi-Tenant Security',
    objective: 'Implement ownership checks ensuring users can only modify or delete their own resources.',
    tasks: [
      { title: 'Create checkOwnership middleware for user-owned items', desc: 'Compare req.user.id with resource.authorId; allow admins override.', type: 'code', dur: 25 },
      { title: 'Prevent Insecure Direct Object References (IDOR)', desc: 'Ensure users cannot read or mutate other users private records by guessing IDs.', type: 'code', dur: 25 },
      { title: 'Write tests verifying cross-user access attempts are blocked', desc: 'Test User A attempting to update User B snippet receives 403 Forbidden.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 35,
    moduleIndex: 4,
    title: 'Security Hardening, CORS & Auth Module Audit',
    objective: 'Audit auth flows, configure secure CORS origins, and write automated tests for auth failure cases.',
    tasks: [
      { title: 'Configure CORS with strict origin, credentials, and methods', desc: 'Disallow wildcard origins when credentials: true is enabled.', type: 'code', dur: 25 },
      { title: 'Sanitize error outputs to prevent account enumeration', desc: 'Ensure password reset and login endpoints do not reveal whether email exists.', type: 'code', dur: 25 },
      { title: 'Execute automated tests for all auth error scenarios', desc: 'Verify 401 on expired tokens, 401 on missing auth header, 422 on invalid emails.', type: 'practice', dur: 25 },
    ],
  },

  // Module 6: Days 36-42: Full-Stack Mini-Project: Personal Knowledge Capture App
  {
    dayNumber: 36,
    moduleIndex: 5,
    title: 'Knowledge Capture App: Backend Models & Architecture',
    objective: 'Design models for Snippets, Categories, and Tags with relationships and validations.',
    tasks: [
      { title: 'Design Snippet model (title, content, language, tags, author)', desc: 'Create Mongoose schema with text indexes for search.', type: 'code', dur: 25 },
      { title: 'Implement Snippet CRUD routes, controllers, and services', desc: 'Expose endpoints for creating, retrieving, updating, and deleting snippets.', type: 'code', dur: 25 },
      { title: 'Scope all snippet queries to authenticated req.user._id', desc: 'Ensure complete user data isolation in all controller methods.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 37,
    moduleIndex: 5,
    title: 'Knowledge Capture App: Tagging, Search & Filter APIs',
    objective: 'Implement full-text search on snippet content and multi-tag filtering with aggregation.',
    tasks: [
      { title: 'Create MongoDB text index on title and content', desc: 'Build text search endpoint using $text and $search with relevance score sorting.', type: 'code', dur: 25 },
      { title: 'Implement tag aggregation endpoint returning tag counts', desc: 'Use $unwind and $sortByCount to list all tags with snippet counts.', type: 'code', dur: 25 },
      { title: 'Add language filtering and date-range filters to snippet API', desc: 'Allow filtering snippets by JavaScript, Python, SQL, etc., with pagination.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 38,
    moduleIndex: 5,
    title: 'Knowledge Capture App: React Frontend Scaffold & Auth Flow',
    objective: 'Build React frontend shell, configure React Router, and connect login/registration views.',
    tasks: [
      { title: 'Scaffold React frontend with Tailwind CSS and React Router', desc: 'Configure navbar, sidebar layout, and responsive container structure.', type: 'code', dur: 25 },
      { title: 'Build Login and Register views with React Hook Form', desc: 'Connect to backend auth endpoints and store token securely.', type: 'code', dur: 25 },
      { title: 'Create AuthContext managing user session and automatic redirect', desc: 'Redirect user to dashboard on login and clear state on logout.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 39,
    moduleIndex: 5,
    title: 'Knowledge Capture App: Snippet Feed & Interactive Tag Cloud',
    objective: 'Build snippet card grid with syntax highlighting, tag badges, and copy-to-clipboard action.',
    tasks: [
      { title: 'Build SnippetCard component with code preview and language badge', desc: 'Render snippet metadata, creation date, and formatted code block.', type: 'code', dur: 25 },
      { title: 'Implement interactive Tag Cloud sidebar filter', desc: 'Clicking a tag filters snippet list instantly via query parameters.', type: 'code', dur: 25 },
      { title: 'Add one-click Copy Code to Clipboard button with feedback toast', desc: 'Use navigator.clipboard.writeText with animated copied feedback.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 40,
    moduleIndex: 5,
    title: 'Knowledge Capture App: Create & Edit Snippet Modal Form',
    objective: 'Build modal dialog for creating and updating snippets with real-time tag input parsing.',
    tasks: [
      { title: 'Create accessible SnippetModal with backdrop & form controls', desc: 'Support title, language dropdown, code editor textarea, and tag input.', type: 'code', dur: 25 },
      { title: 'Implement tag input parsing comma-separated or space-separated tags', desc: 'Render interactive removable tag pills inside form as user types.', type: 'code', dur: 25 },
      { title: 'Connect create and edit actions to backend API with optimistic updates', desc: 'Immediately insert new snippet into state and sync with server response.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 41,
    moduleIndex: 5,
    title: 'Knowledge Capture App: Debounced Search & Pagination Controls',
    objective: 'Integrate live search bar with custom debounce and pagination controls on frontend.',
    tasks: [
      { title: 'Connect debounced search input to backend search endpoint', desc: 'Search snippets in real-time as user types without overwhelming server.', type: 'code', dur: 25 },
      { title: 'Implement pagination footer showing total snippets & pages', desc: 'Provide Prev/Next buttons and page numbers synced to URL query.', type: 'code', dur: 25 },
      { title: 'Handle empty states for search queries with no results', desc: 'Display friendly EmptyState illustration with Clear Filters action button.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 42,
    moduleIndex: 5,
    title: 'Knowledge Capture App: End-to-End Integration & Polish',
    objective: 'Conduct end-to-end testing, error toast handling, and document application architecture.',
    tasks: [
      { title: 'Integrate Toast notification provider for API feedback', desc: 'Display success and error toasts for all CRUD operations.', type: 'code', dur: 25 },
      { title: 'Perform complete end-to-end walkthrough of all user flows', desc: 'Register, create 5 snippets, filter by tag, search, edit, delete, and logout.', type: 'practice', dur: 25 },
      { title: 'Write comprehensive project README and architecture diagram', desc: 'Document API endpoints, frontend component tree, and setup instructions.', type: 'project', dur: 25 },
    ],
  },

  // Module 7: Days 43-49: Testing & Performance
  {
    dayNumber: 43,
    moduleIndex: 6,
    title: 'Unit Testing Fundamentals with Jest & Vitest',
    objective: 'Configure test runner, understand test pyramid, and write unit tests for utility functions.',
    tasks: [
      { title: 'Study Test Pyramid: Unit, Integration, and E2E ratios', desc: 'Understand test isolation, mock boundaries, and fast feedback loops.', type: 'learn', dur: 25 },
      { title: 'Configure Vitest / Jest test runner with coverage reports', desc: 'Set up test scripts, assertion matchers, and coverage thresholds in package.json.', type: 'code', dur: 25 },
      { title: 'Write unit tests for date utilities, query parsers, and validators', desc: 'Test edge cases, invalid inputs, null values, and verify assertions pass.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 44,
    moduleIndex: 6,
    title: 'React Testing Library: Component Rendering & User Events',
    objective: 'Test React components using React Testing Library and @testing-library/user-event.',
    tasks: [
      { title: 'Study React Testing Library philosophy: Test behavior, not implementation', desc: 'Prefer getByRole, getByText, getByLabelText over test IDs.', type: 'learn', dur: 25 },
      { title: 'Write component tests for Button, Input, and Modal components', desc: 'Test click handlers, disabled states, and open/close interactions.', type: 'code', dur: 25 },
      { title: 'Test asynchronous data rendering using findByRole and waitFor', desc: 'Mock fetch API and verify loading skeletons transition to loaded data.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 45,
    moduleIndex: 6,
    title: 'Express Route Integration Testing with Supertest',
    objective: 'Test Express API endpoints using Supertest without starting a live HTTP server.',
    tasks: [
      { title: 'Set up Supertest with Express app instance', desc: 'Configure test helper with request(app) and clean test teardown.', type: 'code', dur: 25 },
      { title: 'Test public and protected endpoints with valid/invalid tokens', desc: 'Verify status codes: 200 on success, 401 on missing token, 403 on forbidden role.', type: 'code', dur: 25 },
      { title: 'Assert JSON response structure and headers with Supertest matchers', desc: 'Expect content-type application/json and validate error payload fields.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 46,
    moduleIndex: 6,
    title: 'Database Integration Testing with In-Memory MongoDB',
    objective: 'Run integration tests against mongodb-memory-server with database cleanup before each test.',
    tasks: [
      { title: 'Configure mongodb-memory-server for isolated test execution', desc: 'Spin up ephemeral MongoDB instance in memory before test suite runs.', type: 'code', dur: 25 },
      { title: 'Write beforeEach database cleanup hooks', desc: 'Clear all collections between tests to guarantee test independence.', type: 'code', dur: 25 },
      { title: 'Test full Mongoose CRUD and validation rules in integration tests', desc: 'Verify duplicate unique key rejections and required field errors.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 47,
    moduleIndex: 6,
    title: 'React DevTools Profiler & Re-Render Auditing',
    objective: 'Profile React component rendering with React DevTools Profiler and eliminate wasted renders.',
    tasks: [
      { title: 'Profile React application using React DevTools Profiler', desc: 'Identify components with high render counts and longest render durations.', type: 'practice', dur: 25 },
      { title: 'Inspect Why did this render reason in Profiler flamegraph', desc: 'Diagnose unstable object references and anonymous function props.', type: 'code', dur: 25 },
      { title: 'Refactor identified bottlenecks using memoization and state colocation', desc: 'Move local state down the tree and verify re-render count drops to 1.', type: 'code', dur: 25 },
    ],
  },
  {
    dayNumber: 48,
    moduleIndex: 6,
    title: 'Database Query Optimization & Production Index Audit',
    objective: 'Audit database queries under load, verify index usage, and eliminate unindexed scans.',
    tasks: [
      { title: 'Audit all application queries against existing database indexes', desc: 'Verify that every find() query uses an active index and avoids table scan.', type: 'code', dur: 25 },
      { title: 'Add missing compound indexes for high-frequency filters', desc: 'Benchmark query latency before and after index creation.', type: 'code', dur: 25 },
      { title: 'Enforce strict query limits and pagination maximums', desc: 'Prevent memory exhaustion by capping maximum query limit to 100 items.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 49,
    moduleIndex: 6,
    title: 'Continuous Integration (CI) Workflow with GitHub Actions',
    objective: 'Configure GitHub Actions CI pipeline running linter, typecheck, and automated tests on every push.',
    tasks: [
      { title: 'Create .github/workflows/ci.yml workflow file', desc: 'Define jobs for Node.js matrix testing (Node 20, 22) on ubuntu-latest.', type: 'code', dur: 25 },
      { title: 'Configure automated linting, formatting check, and test execution', desc: 'Run npm run lint and npm test with fail-fast behavior on errors.', type: 'code', dur: 25 },
      { title: 'Add test coverage report generation and badge to README', desc: 'Upload coverage artifacts and display passing build status badge.', type: 'practice', dur: 25 },
    ],
  },

  // Module 8: Days 50-56: Docker & Deployment
  {
    dayNumber: 50,
    moduleIndex: 7,
    title: 'Backend Dockerfile & Container Best Practices',
    objective: 'Write multi-stage Dockerfile for Node.js Express backend using alpine base and non-root user.',
    tasks: [
      { title: 'Study Docker containerization principles and image layering', desc: 'Understand layer caching, .dockerignore, and minimizing image footprint.', type: 'learn', dur: 25 },
      { title: 'Write production Dockerfile for Express backend', desc: 'Use node:20-alpine, copy package.json first for caching, and install production deps.', type: 'code', dur: 25 },
      { title: 'Configure non-root user (node) for enhanced container security', desc: 'Switch USER node to prevent container escape and privilege escalation.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 51,
    moduleIndex: 7,
    title: 'Frontend Multi-Stage Dockerfile with Nginx',
    objective: 'Build React Vite frontend in Node stage and serve static assets via Nginx alpine container.',
    tasks: [
      { title: 'Write multi-stage Dockerfile for React Vite application', desc: 'Stage 1: build Vite assets; Stage 2: copy dist into nginx:alpine.', type: 'code', dur: 25 },
      { title: 'Configure nginx.conf for Single Page Application (SPA) routing', desc: 'Configure try_files $uri $uri/ /index.html; to support React Router refresh.', type: 'code', dur: 25 },
      { title: 'Build and run frontend Docker container locally', desc: 'Verify fast response times, asset gzip compression, and client-side routing.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 52,
    moduleIndex: 7,
    title: 'Docker Compose Multi-Service Orchestration',
    objective: 'Orchestrate frontend, backend, and database in docker-compose.yml with networking and volumes.',
    tasks: [
      { title: 'Write docker-compose.yml defining frontend, backend, and db services', desc: 'Map host ports, configure bridge network, and link service dependencies.', type: 'code', dur: 25 },
      { title: 'Configure named persistent volume for database data', desc: 'Ensure database records persist across container restarts and updates.', type: 'code', dur: 25 },
      { title: 'Start entire MERN stack using docker compose up --build', desc: 'Verify inter-container DNS communication using service names (e.g., http://backend:5000).', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 53,
    moduleIndex: 7,
    title: 'Docker Environment Variables & Health Checks',
    objective: 'Manage environment variables via .env.docker and configure container health checks.',
    tasks: [
      { title: 'Separate environment configurations (.env.example, .env.docker)', desc: 'Inject environment variables into containers without committing secrets.', type: 'code', dur: 25 },
      { title: 'Configure Docker health checks for backend and database', desc: 'Define healthcheck with test: [CMD, curl, -f, http://localhost:5000/api/health].', type: 'code', dur: 25 },
      { title: 'Use depends_on condition: service_healthy for startup ordering', desc: 'Ensure backend container only starts after database container is fully healthy.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 54,
    moduleIndex: 7,
    title: 'Cloud Deployment Preparation & Production Builds',
    objective: 'Prepare deployment configurations for cloud platforms (Render, Railway, Fly.io, or AWS).',
    tasks: [
      { title: 'Configure production build scripts and environment validation', desc: 'Ensure backend validates all required production environment variables on boot.', type: 'code', dur: 25 },
      { title: 'Test production build locally with production environment flags', desc: 'Run NODE_ENV=production node src/server.js and verify asset serving.', type: 'code', dur: 25 },
      { title: 'Prepare cloud deployment manifests and connection string secrets', desc: 'Set up cloud database credentials and configure CORS for production domain.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 55,
    moduleIndex: 7,
    title: 'Cloud Deployment Execution & Live Verification',
    objective: 'Deploy MERN application to cloud provider, configure custom domain/TLS, and verify live endpoints.',
    tasks: [
      { title: 'Deploy backend and database services to cloud host', desc: 'Trigger deployment from Git repository and verify container startup logs.', type: 'practice', dur: 25 },
      { title: 'Deploy React frontend to Vercel, Netlify, or cloud container', desc: 'Configure VITE_API_BASE_URL to point to live backend HTTPS domain.', type: 'practice', dur: 25 },
      { title: 'Verify live end-to-end functionality on production HTTPS domain', desc: 'Test user registration, login, snippet creation, and database persistence live.', type: 'practice', dur: 25 },
    ],
  },
  {
    dayNumber: 56,
    moduleIndex: 7,
    title: 'MERN Track Capstone Review, Architecture Docs & Portfolio Polish',
    objective: 'Assemble comprehensive architecture documentation, demo screenshots, and write resume project bullets.',
    tasks: [
      { title: 'Draw complete MERN Architecture Diagram', desc: 'Diagram React frontend, Nginx reverse proxy, Express backend, and MongoDB.', type: 'project', dur: 25 },
      { title: 'Finalize GitHub repository README with setup guide and screenshots', desc: 'Add badges, architecture diagram, API documentation, and live demo link.', type: 'project', dur: 25 },
      { title: 'Draft high-impact resume bullet points using XYZ format', desc: 'Formulate metrics-driven resume points (e.g., Reduced latency by 45% using compound indexes).', type: 'revise', dur: 25 },
    ],
  },
];

export const mernCurriculum = {
  roadmapSlug: 'mern-stack-maintenance',
  modules: mernModules,
  days: dayDefinitions.map((d) => ({
    dayNumber: d.dayNumber,
    moduleIndex: d.moduleIndex,
    title: d.title,
    objective: d.objective,
    estimatedStudyTime: 75,
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
