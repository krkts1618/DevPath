import fs from 'fs';
import path from 'path';

const springBootCurriculum = [
  // WEEK 1
  {
    week: 1,
    title: "Week 1 — Spring Boot foundations",
    description: "Setup, architecture, REST fundamentals, IoC, DI, beans, and building the Campus Event Discovery API.",
    startingDay: 1,
    endingDay: 7,
    days: [
      {
        dayNumber: 1,
        title: "Java/Spring revision audit, Maven, Spring Initializr, project structure",
        topic: "Java/Spring revision audit, Maven, Spring Initializr, project structure",
        tasks: [
          {
            title: "Audit Java 17/21 language features and Spring Boot 3 architectural principles",
            description: "Review records, sealed classes, pattern matching, virtual threads, and understand Spring Boot opinionated auto-configuration.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Bootstrap Spring Boot project via Spring Initializr and configure Maven pom.xml",
            description: "Generate project with Spring Web, Lombok, DevTools, and Spring Boot Actuator. Inspect dependencies, parent POM, and standard directory layout.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Verify @SpringBootApplication entry point and build lifecycle",
            description: "Run `./mvnw clean package` and inspect generated JAR structure, embedded Tomcat bootstrapping, and application startup logs.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 2,
        title: "IoC, DI, beans, component scanning, bean lifecycle revision",
        topic: "IoC, DI, beans, component scanning, bean lifecycle revision",
        tasks: [
          {
            title: "Master Inversion of Control (IoC) and Dependency Injection (DI) theory",
            description: "Understand Spring BeanFactory and ApplicationContext containers, bean definition lifecycles, and component scanning boundaries.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Configure beans and inspect BeanPostProcessor and lifecycle hooks",
            description: "Implement @PostConstruct and @PreDestroy callbacks. Verify bean creation, initialization, and disposal sequence in console output.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Inspect ApplicationContext bean registry programmatically",
            description: "Inject ApplicationContext via CommandLineRunner and log all loaded bean names and singletons to confirm component scanning behavior.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 3,
        title: "@Component, @Service, @Repository, constructor injection",
        topic: "@Component, @Service, @Repository, constructor injection",
        tasks: [
          {
            title: "Analyze Spring stereotype annotations: @Component, @Service, and @Repository",
            description: "Understand semantic separation of stereotypes and automatic persistence exception translation provided by @Repository.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Implement clean constructor-based dependency injection with Lombok @RequiredArgsConstructor",
            description: "Refactor classes to use immutable final fields with constructor injection, avoiding problematic field-level @Autowired.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Audit circular dependency prevention and mockability test",
            description: "Construct a unit test proving constructor injection enables clean instantiation and mock injection without starting the Spring container.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 4,
        title: "REST principles, HTTP methods, status codes, JSON",
        topic: "REST principles, HTTP methods, status codes, JSON",
        tasks: [
          {
            title: "Study REST architectural constraints and HTTP specification standards",
            description: "Examine resource-oriented URIs, statelessness, idempotency of GET/PUT/DELETE, non-idempotence of POST, and HTTP status code categories (2xx, 4xx, 5xx).",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Map REST resources with standard HTTP verbs and Jackson JSON serialization",
            description: "Configure Jackson ObjectMapper settings (naming strategy, date-time formats, null handling) and inspect serialized JSON outputs.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Document REST API endpoint matrix with strict status code specifications",
            description: "Create an API design table specifying URIs, verbs, request shapes, and exact response codes for 200 OK, 201 Created, 204 No Content, 400, 404.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 5,
        title: "@RestController, @GetMapping, @PostMapping, @PathVariable, @RequestParam",
        topic: "@RestController, @GetMapping, @PostMapping, @PathVariable, @RequestParam",
        tasks: [
          {
            title: "Understand @RestController architecture and Spring MVC request handling",
            description: "Explore DispatcherServlet, HandlerMapping, and how @ResponseBody serializes domain objects directly to the HTTP response stream.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Implement REST controller with path variables and request parameter filtering",
            description: "Create endpoints binding `@PathVariable(\"id\")` and `@RequestParam(required = false, defaultValue = \"...\")` with type conversion.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Verify query parameter parsing and 400 Bad Request handling for invalid types",
            description: "Execute cURL / HTTP requests testing edge cases: missing required parameters, malformed types, and special URL-encoded characters.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 6,
        title: "Request bodies, response objects, Postman testing",
        topic: "Request bodies, response objects, Postman testing",
        tasks: [
          {
            title: "Deep dive into @RequestBody deserialization and ResponseEntity encapsulation",
            description: "Learn how HttpMessageConverter deserializes JSON payloads and how ResponseEntity enables custom headers and status codes.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Implement structured request payloads and typed API response wrappers",
            description: "Create standard ApiResponse<T> wrapper containing timestamp, status, payload, and optional metadata.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Create comprehensive Postman collection and environment test runner",
            description: "Export collection with automated assertion scripts validating response status codes, content-type headers, and JSON schema properties.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 7,
        title: "Task 1: Build a Campus Event Discovery API with in-memory data",
        topic: "Task 1: Build a Campus Event Discovery API with in-memory data. Deliverable: Working REST API with event listing, search, and event details.",
        tasks: [
          {
            title: "Architect Campus Event Discovery API domain models and in-memory store",
            description: "Design Event model (id, title, description, category, venue, eventDate, capacity) and thread-safe ConcurrentHashMap repository.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Implement complete Campus Event REST endpoints and search filter logic",
            description: "Build GET /api/events, GET /api/events/{id}, POST /api/events, and search by category, date range, or title keywords.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Verify Campus Event API deliverable with end-to-end Postman suite",
            description: "Execute full verification: create 5 campus events, filter by department, retrieve single event, verify 404 for invalid IDs.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
    ],
  },

  // WEEK 2
  {
    week: 2,
    title: "Week 2 — Layered architecture and CRUD",
    description: "Controller → service → repository separation, DTOs, request/response models, ResponseEntity, and Personal Finance Rules API.",
    startingDay: 8,
    endingDay: 14,
    days: [
      {
        dayNumber: 8,
        title: "Layered architecture and separation of concerns",
        topic: "Layered architecture and separation of concerns",
        tasks: [
          {
            title: "Study enterprise 3-tier layered architecture principles and boundaries",
            description: "Analyze responsibilities of Web Layer (HTTP/transport), Service Layer (business logic/rules), and Data Layer (persistence abstraction).",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Refactor monolithic controllers into strict Controller-Service-Repository tiers",
            description: "Ensure controllers contain zero business logic; delegate all computation and state transitions to @Service classes.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Verify architectural compliance and dependency isolation",
            description: "Confirm controllers only depend on services, services only depend on repositories, and no persistence entities leak directly into controllers.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 9,
        title: "DTOs, request/response models, mapping",
        topic: "DTOs, request/response models, mapping",
        tasks: [
          {
            title: "Understand Data Transfer Object (DTO) pattern and entity decoupling",
            description: "Examine security risks of exposing domain entities (over-posting, mass assignment) and compare manual mapping vs MapStruct.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Implement CreateRequestDto, UpdateRequestDto, and ResponseDto models",
            description: "Create Java records for immutable request/response payloads with factory mapper methods or MapStruct mappers.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Test field transformation and defensive copying in DTO conversions",
            description: "Write unit tests validating that entity modifications do not mutate previously returned DTOs and internal IDs remain protected.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 10,
        title: "CRUD service methods and business logic",
        topic: "CRUD service methods and business logic",
        tasks: [
          {
            title: "Analyze business logic isolation and transactional service boundaries",
            description: "Study how service methods coordinate multiple repository calls, enforce domain invariants, and prevent corrupt partial states.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Implement full CRUD operations in service layer with defensive checks",
            description: "Build create, findById, findAll, update, and delete service methods with duplicate detection and existence verification.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Write unit tests for service business logic using mocked repositories",
            description: "Verify that service methods invoke repository methods with correct parameters and enforce business rules before persistence.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 11,
        title: "Repository abstraction and interface design",
        topic: "Repository abstraction and interface design",
        tasks: [
          {
            title: "Explore Repository Pattern and Dependency Inversion Principle",
            description: "Study how defining interface contracts decouples business services from concrete storage mechanisms (in-memory, SQL, NoSQL).",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Design repository interfaces with generic CRUD signatures",
            description: "Create generic CrudRepository<T, ID> interface with save, findById, findAll, deleteById, and existsById methods.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Implement and benchmark in-memory concurrent repository implementation",
            description: "Implement repository using ConcurrentHashMap and verify thread safety under multi-threaded read/write workloads.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 12,
        title: "HTTP status codes, ResponseEntity, proper API responses",
        topic: "HTTP status codes, ResponseEntity, proper API responses",
        tasks: [
          {
            title: "Study REST status code standards and semantic response headers",
            description: "Review proper HTTP responses: 201 Created with Location header, 204 No Content for deletion, 404 Not Found, and 409 Conflict.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Refactor controllers to return typed ResponseEntity with headers and URI builders",
            description: "Use `ResponseEntity.created(locationUri).body(...)` and `ResponseEntity.noContent().build()` across all endpoints.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Verify API response headers and status codes across all CRUD endpoints",
            description: "Perform automated cURL calls verifying Location header on POST, 204 status on DELETE, and 200 status with JSON body on PUT/GET.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 13,
        title: "API testing, edge cases, input validation basics",
        topic: "API testing, edge cases, input validation basics",
        tasks: [
          {
            title: "Analyze common API failure modes, boundaries, and input attack vectors",
            description: "Understand edge cases: empty strings, negative amounts, null payloads, oversized strings, and invalid ID formats.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Implement preliminary manual input validation and boundary guards in service layer",
            description: "Validate non-null fields, positive values, date constraints, and throw IllegalArgumentException on invalid input.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Execute negative test scenarios and verify error payloads",
            description: "Send invalid JSON requests via Postman and verify clean rejection without application crash or stack trace leakage.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 14,
        title: "Task 2: Build a Personal Finance Rules API (in-memory version)",
        topic: "Task 2: Build a Personal Finance Rules API (in-memory version). Deliverable: Rule-based expense categorization and monthly spending summaries, without payment integration.",
        tasks: [
          {
            title: "Architect Personal Finance Rules domain models, DTOs, and categorization rules",
            description: "Design Expense (id, title, amount, category, date, tags) and Rule engine (keyword matching, threshold classification, monthly budget targets).",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Implement Personal Finance service, layered CRUD endpoints, and summary calculations",
            description: "Build endpoints to log expenses, apply auto-categorization rules, and compute monthly spending summaries grouped by category.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Verify Personal Finance API deliverable with test scenarios",
            description: "Test rule-based classification on 10 varied expenses, verify monthly summary aggregation, and validate category breakdown percentages.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
    ],
  },

  // WEEK 3
  {
    week: 3,
    title: "Week 3 — SQL, JPA and Hibernate",
    description: "Persistent storage, Spring Data JPA, entities, derived queries, associations (1:1, 1:N, N:M), and Research Paper & Citation API.",
    startingDay: 15,
    endingDay: 21,
    days: [
      {
        dayNumber: 15,
        title: "JDBC vs JPA vs Hibernate; persistence concepts",
        topic: "JDBC vs JPA vs Hibernate; persistence concepts",
        tasks: [
          {
            title: "Compare low-level JDBC, JPA specification, and Hibernate ORM engine",
            description: "Analyze object-relational impedance mismatch, connection pooling, SQL generation, and advantages of declarative persistence.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Inspect Hibernate Session, EntityManager, and persistence context states",
            description: "Understand entity lifecycle states: Transient, Managed (Persistent), Detached, and Removed.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Document dirty checking mechanism and automatic SQL generation",
            description: "Trace how changes to managed entities automatically emit SQL UPDATE statements on transaction flush.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 16,
        title: "Spring Data JPA, dependencies, datasource configuration",
        topic: "Spring Data JPA, dependencies, datasource configuration",
        tasks: [
          {
            title: "Configure spring-boot-starter-data-jpa and HikariCP connection pool",
            description: "Configure application.yml with datasource URL, driver-class, Hikari pool sizing, and Hibernate dialect.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Connect Spring Boot to PostgreSQL database and configure schema generation",
            description: "Set `spring.jpa.hibernate.ddl-auto: validate` or `update` for dev and enable SQL formatting and parameter logging.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Verify database connectivity via health actuator endpoint",
            description: "Hit `/actuator/health` and verify database ping, Hikari pool initialization, and connection acquisition latency.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 17,
        title: "Entities, IDs, generated values, column mappings",
        topic: "Entities, IDs, generated values, column mappings",
        tasks: [
          {
            title: "Master JPA annotations: @Entity, @Table, @Id, @GeneratedValue, and @Column",
            description: "Analyze primary key strategies: IDENTITY, SEQUENCE, and UUID generation. Review column nullability, uniqueness, and length constraints.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Implement persistent JPA entities with audit timestamps",
            description: "Build entities with `@CreationTimestamp`, `@UpdateTimestamp`, and explicit column mappings avoiding reserved SQL keywords.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Inspect generated DDL schema in PostgreSQL database",
            description: "Use psql or pgAdmin to inspect generated tables, column types, primary key constraints, and default values.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 18,
        title: "CRUD repositories and database persistence",
        topic: "CRUD repositories and database persistence",
        tasks: [
          {
            title: "Explore JpaRepository, PagingAndSortingRepository, and CrudRepository hierarchies",
            description: "Understand Spring Data JPA dynamic proxy generation and built-in methods: save, findById, findAll, count, delete.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Implement Spring Data JPA repository interfaces and service integration",
            description: "Replace in-memory data structures with JpaRepository interfaces, adapting service methods to use persistent repository calls.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Verify end-to-end database persistence across application restarts",
            description: "Create records via POST, restart Spring Boot application, and query GET endpoints to confirm data persists in PostgreSQL.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 19,
        title: "Derived queries, JPQL, pagination, sorting",
        topic: "Derived queries, JPQL, pagination, sorting",
        tasks: [
          {
            title: "Master Spring Data method name query derivation rules and JPQL syntax",
            description: "Learn keyword keywords: findBy, ContainingIgnoreCase, Between, OrderBy, and custom @Query with JPQL positional/named parameters.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Implement Paginated and Sorted repository queries with Pageable",
            description: "Add Pageable parameter to repository methods and return Page<T> or Slice<T> with total elements and page count metadata.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Test pagination and sorting endpoints with complex query params",
            description: "Verify requests like `?page=0&size=10&sort=createdAt,desc` and confirm SQL query uses LIMIT and OFFSET efficiently.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 20,
        title: "One-to-one, one-to-many, many-to-one relationships",
        topic: "One-to-one, one-to-many, many-to-one relationships",
        tasks: [
          {
            title: "Study entity relationship mappings and foreign key ownership in JPA",
            description: "Analyze @OneToOne, @OneToMany, @ManyToOne, `mappedBy`, CascadeType (ALL, PERSIST, REMOVE), and FetchType (LAZY vs EAGER).",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Implement bidirectional parent-child relationship with helper methods",
            description: "Create bidirectional relationship with proper add/remove synchronization methods to prevent orphaned state in persistence context.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Verify cascade persist and cascade delete operations in database",
            description: "Persist parent entity with child items in a single save call and inspect foreign keys and cascade effects in PostgreSQL.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 21,
        title: "Task 3: Build a Research Paper & Citation API with relational tables",
        topic: "Task 3: Build a Research Paper & Citation API with relational tables. Deliverable: Researchers, papers, and citations stored in MySQL or PostgreSQL.",
        tasks: [
          {
            title: "Design Research Paper & Citation relational schema and ER model",
            description: "Architect Researcher (id, name, affiliation, email), Paper (id, title, abstract, publishedYear, doi), and many-to-many Citation relationship.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Implement Paper & Citation JPA entities, repositories, and REST controllers",
            description: "Build endpoints to publish papers, link citations between papers, calculate citation count metrics, and list researcher bibliographies.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Verify Research Paper & Citation deliverable with integration tests",
            description: "Create 4 research papers, link citation networks, verify citation graph queries, and validate database relational integrity.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
    ],
  },

  // WEEK 4
  {
    week: 4,
    title: "Week 4 — Reliable APIs",
    description: "Validation, errors, transactions, @Valid, @ControllerAdvice, @Transactional, indexing, and Scholarship Eligibility API.",
    startingDay: 22,
    endingDay: 28,
    days: [
      {
        dayNumber: 22,
        title: "Bean Validation, @Valid, constraints",
        topic: "Bean Validation, @Valid, constraints",
        tasks: [
          {
            title: "Study Jakarta Bean Validation specification and standard constraints",
            description: "Explore @NotNull, @NotBlank, @Size, @Min, @Max, @Email, @Pattern, and constraint validation lifecycles on incoming DTOs.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Annotate request DTOs with validation rules and enable @Valid in controllers",
            description: "Add comprehensive constraint annotations to all incoming request DTOs and enforce validation on controller `@Valid @RequestBody`.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Test field validation failures and inspect MethodArgumentNotValidException",
            description: "Send requests with invalid email, empty name, and out-of-range numbers; inspect default validation exception details.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 23,
        title: "Global exception handling with @ControllerAdvice",
        topic: "Global exception handling with @ControllerAdvice",
        tasks: [
          {
            title: "Understand centralized exception handling architecture in Spring MVC",
            description: "Learn how @ControllerAdvice and @RestControllerAdvice intercept exceptions across all controllers and convert them to standard HTTP responses.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Implement GlobalExceptionHandler class with @ExceptionHandler methods",
            description: "Handle MethodArgumentNotValidException, ResourceNotFoundException, and generic Exception with RFC 7807 ProblemDetail format.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Verify unified error response structure across varied error types",
            description: "Validate that validation errors return 400 with field-specific messages, missing entities return 404, and unhandled errors return 500.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 24,
        title: "Custom exceptions and consistent error responses",
        topic: "Custom exceptions and consistent error responses",
        tasks: [
          {
            title: "Design domain-specific custom exception hierarchy",
            description: "Create structured base exception classes (EntityNotFoundException, DuplicateResourceException, BusinessRuleException) with error codes.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Implement consistent ErrorResponse model with timestamp and details",
            description: "Build standardized ErrorResponse record containing status, errorCode, message, path, timestamp, and field-level validation errors.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Audit error sanitization and prevent stack trace leaks in production",
            description: "Verify that internal database errors or SQL syntax messages are masked and never exposed to the client in error responses.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 25,
        title: "Transactions, @Transactional, rollback",
        topic: "Transactions, @Transactional, rollback",
        tasks: [
          {
            title: "Understand database transactions, ACID properties, and Spring AOP transaction proxy",
            description: "Analyze @Transactional propagation levels (REQUIRED, REQUIRES_NEW), isolation levels, and rollback rules (runtime vs checked exceptions).",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Apply @Transactional to multi-step business operations with explicit rollbackOn",
            description: "Wrap multi-table persistence workflows in @Transactional and configure `rollbackFor = Exception.class`.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Simulate service failure and verify database transaction rollback",
            description: "Trigger an intentional exception midway through a multi-step operation and verify that zero partial records remain in the database.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 26,
        title: "Filtering, search, pagination, sorting",
        topic: "Filtering, search, pagination, sorting",
        tasks: [
          {
            title: "Study dynamic query generation strategies: JPA Specifications vs Criteria API",
            description: "Learn how Spring Data JpaSpecificationExecutor enables building dynamic query predicates based on non-null filter criteria.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Implement multi-criteria search with JPA Specification and Pageable",
            description: "Build dynamic search combining text keyword search, date range filters, category dropdowns, and combined multi-column sorting.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Benchmark multi-filter query performance with sample dataset",
            description: "Test combined filter queries with 1,000+ mock records and inspect generated SQL and execution times in database logs.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 27,
        title: "Database constraints, indexes, N+1 query awareness",
        topic: "Database constraints, indexes, N+1 query awareness",
        tasks: [
          {
            title: "Analyze JPA N+1 select problem and performance anti-patterns",
            description: "Understand why LAZY fetching inside loops triggers N+1 SQL queries and compare solutions: JOIN FETCH, @EntityGraph, and DTO projections.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Optimize queries with JOIN FETCH and add database indexes via JPA",
            description: "Refactor repository queries with `@Query(\"SELECT p FROM Paper p JOIN FETCH p.citations\")` and define `@Index` on frequently queried columns.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Inspect SQL statement execution counts and query plans using EXPLAIN",
            description: "Run EXPLAIN ANALYZE on complex queries in PostgreSQL and verify that single SQL queries resolve collections without N+1 overhead.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 28,
        title: "Task 4: Build a Scholarship Eligibility & Application API",
        topic: "Task 4: Build a Scholarship Eligibility & Application API. Deliverable: Eligibility rules, application submission, validation, and application status tracking.",
        tasks: [
          {
            title: "Architect Scholarship Eligibility & Application domain and business rules",
            description: "Design Student, Scholarship, and Application entities with status enum (SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED) and eligibility criteria.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Implement Scholarship application submission, rule engine, and validation",
            description: "Build transactional submission workflow: validate GPA and income thresholds, check application deadline, prevent duplicate submissions.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Verify Scholarship API deliverable with end-to-end status tracking",
            description: "Submit valid and invalid applications, test edge-case GPA boundaries, update review statuses, and verify comprehensive error responses.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
    ],
  },

  // WEEK 5
  {
    week: 5,
    title: "Week 5 — Testing and maintainability",
    description: "JUnit 5, Mockito, MockMvc, integration tests, logging, profiles, OpenAPI/Swagger, and automated testing deliverable.",
    startingDay: 29,
    endingDay: 35,
    days: [
      {
        dayNumber: 29,
        title: "JUnit 5 and unit testing fundamentals",
        topic: "JUnit 5 and unit testing fundamentals",
        tasks: [
          {
            title: "Master JUnit 5 Jupiter architecture and testing annotations",
            description: "Explore @Test, @BeforeEach, @AfterEach, @ParameterizedTest, @ValueSource, and assertion methods (assertEquals, assertThrows).",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Write unit tests for domain business logic and utility methods",
            description: "Create tests verifying calculation algorithms, eligibility checkers, and state transition logic with parameterized test cases.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Configure Maven Surefire plugin and run automated test suite",
            description: "Run `./mvnw test` and inspect test execution reports, execution times, and failure diagnostics.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 30,
        title: "Mockito and service-layer tests",
        topic: "Mockito and service-layer tests",
        tasks: [
          {
            title: "Understand test doubles: Mocks, Stubs, and Spies with Mockito",
            description: "Learn how @ExtendWith(MockitoExtension.class), @Mock, and @InjectMocks isolate service units from external dependencies.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Implement comprehensive service-layer unit tests with Mockito",
            description: "Write tests mocking repository calls (`when(...).thenReturn(...)`), testing happy path, exception throwing, and verifying method invocations (`verify(...)`).",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Measure code coverage on service layer using JaCoCo",
            description: "Configure JaCoCo Maven plugin, generate HTML coverage report, and verify 80%+ branch and line coverage on critical business services.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 31,
        title: "Controller testing with MockMvc",
        topic: "Controller testing with MockMvc",
        tasks: [
          {
            title: "Explore web slice testing with @WebMvcTest and MockMvc",
            description: "Understand lightweight slice testing that loads only the controller layer and Spring MVC infrastructure without starting full embedded server.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Write MockMvc tests validating endpoints, status codes, and JSON responses",
            description: "Use `mockMvc.perform(...)`, `andExpect(status().isOk())`, and `andExpect(jsonPath(\"$.data.id\").exists())` on GET and POST routes.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Test validation failure responses with MockMvc",
            description: "Send invalid JSON payloads via MockMvc and assert that 400 Bad Request is returned with exact field error messages.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 32,
        title: "Integration tests and test database configuration",
        topic: "Integration tests and test database configuration",
        tasks: [
          {
            title: "Study integration testing strategies with @SpringBootTest and Testcontainers",
            description: "Compare in-memory H2 database testing vs Testcontainers spinning up ephemeral real PostgreSQL Docker containers.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Implement full end-to-end integration test with @SpringBootTest and TestRestTemplate",
            description: "Configure Spring Boot test environment, perform real HTTP requests against random server port, and verify database state persistence.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Verify test isolation and database rollback between integration tests",
            description: "Ensure test cases do not pollute shared test database by using @Transactional test boundaries or database cleanup hooks.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 33,
        title: "Logging, profiles, environment-based configuration",
        topic: "Logging, profiles, environment-based configuration",
        tasks: [
          {
            title: "Master Spring Profiles (dev, test, prod) and SLF4J/Logback logging",
            description: "Understand hierarchical configuration via application-{profile}.yml, environment variable overrides, and logging levels (DEBUG, INFO, WARN, ERROR).",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Configure Logback XML with structured logging and profile-specific datasources",
            description: "Set up console colorized logging for dev and JSON/file rolling appenders for prod; configure dev and prod database profiles.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Verify profile activation and log output filtering",
            description: "Launch application with `-Dspring.profiles.active=dev` and `-Dspring.profiles.active=prod` to verify profile-specific properties.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 34,
        title: "API documentation with OpenAPI/Swagger",
        topic: "API documentation with OpenAPI/Swagger",
        tasks: [
          {
            title: "Study OpenAPI 3.0 specification standards and SpringDoc OpenAPI integration",
            description: "Explore swagger annotations: @Operation, @ApiResponse, @Parameter, @Schema, and interactive Swagger UI capabilities.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Integrate springdoc-openapi-starter-webmvc-ui and document all endpoints",
            description: "Configure OpenAPI bean with API metadata, contact information, server URLs, and annotate controllers with descriptive tags.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Test endpoints interactively in Swagger UI and export OpenAPI JSON spec",
            description: "Navigate to `/swagger-ui.html`, test request submission directly from browser, and download `openapi.json` for client SDK generation.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 35,
        title: "Task 5: Add automated tests and documentation to an existing API",
        topic: "Task 5: Add automated tests and documentation to an existing API. Deliverable: Tested, documented, and configurable backend.",
        tasks: [
          {
            title: "Audit test plan and documentation requirements for target API",
            description: "Select previously built API (Scholarship or Event API), identify untested edge cases, and define complete OpenAPI schemas.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Implement full test suite (Unit, MockMvc, Integration) and complete OpenAPI docs",
            description: "Add comprehensive unit tests for services, web tests for controllers, integration tests for DB, and complete Swagger schemas.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Verify Task 5 deliverable: clean build, 100% tests passing, live Swagger UI",
            description: "Execute `./mvnw verify`, confirm all tests pass cleanly, and verify full interactive API documentation in browser.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
    ],
  },

  // WEEK 6
  {
    week: 6,
    title: "Week 6 — Spring Security",
    description: "Authentication and authorization, filter chain, BCrypt, JWT, roles, permissions, CORS, and Skill-Swap Community API.",
    startingDay: 36,
    endingDay: 42,
    days: [
      {
        dayNumber: 36,
        title: "Spring Security architecture and filter chain",
        topic: "Spring Security architecture and filter chain",
        tasks: [
          {
            title: "Master Spring Security 6 architecture and DelegatingFilterProxy",
            description: "Understand SecurityFilterChain, SecurityContextHolder, AuthenticationManager, and the sequence of security filters.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Configure SecurityFilterChain bean with stateless session management",
            description: "Create SecurityConfig class disabling CSRF for REST, setting `SessionCreationPolicy.STATELESS`, and permitting public endpoints.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Test endpoint access with unauthenticated requests",
            description: "Verify that public routes return 200 while protected routes immediately return 401 Unauthorized or 403 Forbidden.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 37,
        title: "Password hashing with BCrypt",
        topic: "Password hashing with BCrypt",
        tasks: [
          {
            title: "Study password security principles, salts, work factors, and hashing algorithms",
            description: "Analyze cryptographic security of BCrypt, Argon2, work factors (strength parameter), and defense against rainbow table attacks.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Configure BCryptPasswordEncoder bean and implement User entity with hashed passwords",
            description: "Register PasswordEncoder bean in Spring configuration, encode raw passwords on user creation, and ensure passwords are never stored in plain text.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Verify password verification and hash uniqueness across identical passwords",
            description: "Test password verification with `passwordEncoder.matches(...)` and confirm different hashes are generated for identical passwords due to salt.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 38,
        title: "Registration and login flows",
        topic: "Registration and login flows",
        tasks: [
          {
            title: "Design secure authentication workflow and UserDetailsService integration",
            description: "Review standard registration, email uniqueness checks, login credential validation, and custom UserDetails implementation.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Implement /api/auth/register and /api/auth/login endpoints",
            description: "Build registration with validation, duplicate email check, and authentication service validating credentials against database.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Test registration and login with positive and negative credentials",
            description: "Verify successful registration, duplicate registration rejection (409 Conflict), and invalid password rejection (401 Unauthorized).",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 39,
        title: "JWT authentication and token validation",
        topic: "JWT authentication and token validation",
        tasks: [
          {
            title: "Understand JSON Web Token (JWT) structure, claims, signing, and verification",
            description: "Analyze header, payload (sub, exp, iat, custom claims), HMAC-SHA256 signature, secret keys, and stateless authentication benefits.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Implement JwtService for token generation, extraction, and validation",
            description: "Use `io.jsonwebtoken` (jjwt) to generate JWT tokens on login and build `JwtAuthenticationFilter` reading `Bearer` token from Authorization header.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Verify JWT filter injection and SecurityContext population",
            description: "Send requests with valid, expired, and tampered tokens; confirm SecurityContext is correctly populated only for valid signatures.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 40,
        title: "Roles, authorities, and endpoint authorization",
        topic: "Roles, authorities, and endpoint authorization",
        tasks: [
          {
            title: "Study Role-Based Access Control (RBAC) and method security annotations",
            description: "Understand GrantedAuthority, role hierarchies (e.g. ROLE_USER, ROLE_ADMIN), and `@PreAuthorize(\"hasRole('ADMIN')\")`.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Enable method security and apply role restrictions to sensitive endpoints",
            description: "Add `@EnableMethodSecurity` to configuration and protect admin management endpoints with `@PreAuthorize` guards.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Test authorization enforcement across different user roles",
            description: "Authenticate as normal USER and attempt accessing ADMIN endpoint to verify 403 Forbidden; verify ADMIN access returns 200 OK.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 41,
        title: "CORS, security error responses, protected endpoints",
        topic: "CORS, security error responses, protected endpoints",
        tasks: [
          {
            title: "Understand Cross-Origin Resource Sharing (CORS) protocol and preflight OPTIONS",
            description: "Analyze Access-Control-Allow-Origin, allowed methods, allowed headers, credentials, and common browser CORS errors.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Configure global CorsConfigurationSource and custom AuthenticationEntryPoint",
            description: "Set up CORS configuration bean allowing frontend origins and implement custom AuthenticationEntryPoint returning clean JSON on 401.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Verify preflight OPTIONS requests and JSON 401/403 responses",
            description: "Send preflight OPTIONS request with cURL and verify correct CORS response headers; verify JSON format on unauthorized calls.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 42,
        title: "Task 6: Build a Skill-Swap Community API with secure user accounts",
        topic: "Task 6: Build a Skill-Swap Community API with secure user accounts. Deliverable: Users can offer skills, request exchanges, and access role-protected endpoints.",
        tasks: [
          {
            title: "Architect Skill-Swap Community domain models and authorization rules",
            description: "Design User (with roles), SkillListing (title, category, proficiency, description), and SkillExchangeRequest (status, sender, receiver).",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Implement complete Skill-Swap API with JWT security and role guards",
            description: "Build endpoints to post skill offerings, request skill exchanges, approve/reject requests, and admin moderation endpoints.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Verify Skill-Swap API deliverable with multi-user security tests",
            description: "Register two distinct users, create skill listings, initiate exchange request, verify ownership checks, and test admin moderation.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
    ],
  },

  // WEEK 7
  {
    week: 7,
    title: "Week 7 — Advanced backend and Docker",
    description: "Integration and deployment foundations: files, email, Spring Cache, Docker, Dockerfile, Docker Compose, and containerization deliverable.",
    startingDay: 43,
    endingDay: 49,
    days: [
      {
        dayNumber: 43,
        title: "File uploads and downloads",
        topic: "File uploads and downloads",
        tasks: [
          {
            title: "Study multipart file handling and storage architectures",
            description: "Analyze MultipartFile in Spring MVC, file size limits, content-type validation, and local vs object storage (S3/MinIO) strategies.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Implement file upload and download endpoints with validation",
            description: "Build POST endpoint accepting `MultipartFile`, validate mime type and size, generate secure UUID filename, and serve files as Resource.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Test file upload boundaries and path traversal attack prevention",
            description: "Verify rejection of oversized files, validate content-disposition header on download, and test filename sanitization.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 44,
        title: "Email integration and asynchronous task fundamentals",
        topic: "Email integration and asynchronous task fundamentals",
        tasks: [
          {
            title: "Explore asynchronous processing with @Async and Spring Mail",
            description: "Learn how `@EnableAsync` delegates long-running tasks to a ThreadPoolTaskExecutor to keep HTTP response times fast.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Configure JavaMailSender and implement asynchronous notification service",
            description: "Create email service with HTML template support that sends registration welcome and status update emails asynchronously.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Verify non-blocking execution and async exception handling",
            description: "Test endpoint invocation and confirm immediate HTTP 200 response while email dispatch completes in background thread pool.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 45,
        title: "Caching concepts and Spring Cache",
        topic: "Caching concepts and Spring Cache",
        tasks: [
          {
            title: "Master caching strategies, Cache-Aside pattern, and cache invalidation",
            description: "Study `@EnableCaching`, `@Cacheable`, `@CachePut`, and `@CacheEvict`, cache keys, TTL expiration, and cache stampede prevention.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Configure Spring Cache with Caffeine / Redis provider",
            description: "Add `@Cacheable` to heavy database search queries and `@CacheEvict` on create/update/delete operations to maintain cache consistency.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Benchmark response times before and after caching",
            description: "Measure endpoint latency: verify first request hits database (e.g. 80ms) and subsequent requests return from cache in <5ms.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 46,
        title: "Docker images, containers, volumes, networks",
        topic: "Docker images, containers, volumes, networks",
        tasks: [
          {
            title: "Master Docker fundamentals: images, container lifecycles, and layered filesystems",
            description: "Understand union filesystems, image caching, container isolation, volume mounts for persistent data, and bridge networks.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Run PostgreSQL container locally with persistent named volume",
            description: "Execute `docker run --name pg-dev -e POSTGRES_PASSWORD=secret -v pgdata:/var/lib/postgresql/data -p 5432:5432 -d postgres:16-alpine`.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Verify data persistence across container restart and inspection",
            description: "Insert records into PostgreSQL container, stop and remove container, start new container with same volume, and verify data survives.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 47,
        title: "Dockerfile for Spring Boot; build and run the application",
        topic: "Dockerfile for Spring Boot; build and run the application",
        tasks: [
          {
            title: "Study multi-stage Docker builds and minimal runtime images",
            description: "Analyze benefits of multi-stage builds: compile inside maven image, copy JAR to minimal Eclipse Temurin JRE alpine runtime.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Write optimized multi-stage Dockerfile for Spring Boot application",
            description: "Create Dockerfile utilizing layer caching for Maven dependencies, non-root user execution, and optimal JVM memory flags.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Build and run Spring Boot container image locally",
            description: "Execute `docker build -t devpath-backend .` and run container, passing database environment variables and mapping port 8080.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 48,
        title: "Docker Compose for backend and database",
        topic: "Docker Compose for backend and database",
        tasks: [
          {
            title: "Understand multi-container orchestration with Docker Compose",
            description: "Learn compose syntax, services, dependencies (`depends_on` with healthchecks), environment files (.env), and isolated networks.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Create docker-compose.yml defining backend and PostgreSQL services",
            description: "Configure compose file with database healthcheck, volume mounts, environment variables, and network connectivity between services.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Test single-command stack launch and teardown",
            description: "Run `docker compose up -d`, inspect logs with `docker compose logs -f`, verify backend connects to database container, and test `down`.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 49,
        title: "Task 7: Containerize the Skill-Swap API and verify persistence",
        topic: "Task 7: Containerize the Skill-Swap API and verify persistence. Deliverable: A reproducible local development setup.",
        tasks: [
          {
            title: "Architect containerization plan and environment variables for Skill-Swap API",
            description: "Map database URLs, JWT secret keys, port mappings, and volume mounts into standardized `.env.example` template.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Build production Docker Compose setup with database initialization scripts",
            description: "Create complete docker-compose stack including auto-schema migration and healthcheck waiting for PostgreSQL readiness.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Verify Task 7 deliverable: spin up fresh stack from scratch and test APIs",
            description: "Run full test: `docker compose down -v && docker compose up -d --build`, execute Postman smoke tests, and confirm data persistence.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
    ],
  },

  // WEEK 8
  {
    week: 8,
    title: "Week 8 — React + Spring Boot integration",
    description: "Full-stack connection: React project setup, API service layer, Axios, state handling, JWT auth flow, CRUD screens, and Scholarship Dashboard.",
    startingDay: 50,
    endingDay: 56,
    days: [
      {
        dayNumber: 50,
        title: "React project setup and API service layer",
        topic: "React project setup and API service layer",
        tasks: [
          {
            title: "Plan React client architecture and API communication contract",
            description: "Structure React application with modular services, API clients, TypeScript/JS models matching backend DTOs, and environment config.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Configure Axios instance with baseURL and request/response interceptors",
            description: "Create centralized `api.js` client configuring timeout, default headers, and token injection interceptors.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Verify initial API ping and CORS connectivity from React to Spring Boot",
            description: "Make test GET request from React component to Spring Boot backend and verify zero CORS warnings in browser developer console.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 51,
        title: "Axios/fetch, loading states, and API errors",
        topic: "Axios/fetch, loading states, and API errors",
        tasks: [
          {
            title: "Study asynchronous UI state management: idle, loading, success, and error",
            description: "Review best practices for avoiding flash of unstyled content, skeleton loading states, and user-friendly error banners.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Build custom hook or state handler for data fetching with loading/error handling",
            description: "Implement useFetch/useQuery pattern managing loading spinners, data caching, and graceful error messages from backend ProblemDetail.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Test network error resilience and server offline states",
            description: "Simulate backend down (503/network error) in browser network tab and verify UI shows retry button and friendly error message.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 52,
        title: "Forms, validation, and backend error display",
        topic: "Forms, validation, and backend error display",
        tasks: [
          {
            title: "Analyze client-side vs server-side validation synchronization",
            description: "Design form validation mapping backend constraint violation errors directly to individual input fields in the UI.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Build reusable Form component displaying field-level validation errors",
            description: "Implement form handling with validation feedback, mapping backend 400 validation error maps directly under corresponding inputs.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Test invalid form submission and error clearing on user input",
            description: "Submit malformed payload, confirm field errors highlight in red, and verify errors clear as the user types.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 53,
        title: "Authentication flow, token handling, protected routes",
        topic: "Authentication flow, token handling, protected routes",
        tasks: [
          {
            title: "Design secure client-side authentication architecture",
            description: "Review token storage trade-offs (localStorage vs httpOnly cookies), AuthContext state management, and route guard patterns.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Implement AuthContext, login/logout functions, and ProtectedRoute wrapper",
            description: "Build context storing authenticated user and JWT token, automatically attaching Bearer token to requests and redirecting unauthenticated users.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Verify token expiration redirect and 401 response handling",
            description: "Configure Axios response interceptor to detect 401 Unauthorized, clear stored token, and redirect user to `/login`.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 54,
        title: "Search, filters, pagination, and CRUD screens",
        topic: "Search, filters, pagination, and CRUD screens",
        tasks: [
          {
            title: "Study URL state synchronization for search, filters, and pagination",
            description: "Learn how syncing filter states with React Router `useSearchParams` enables shareable links, back button support, and persistence.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Build comprehensive data table with search bar, filter dropdowns, and pagination controls",
            description: "Implement responsive table displaying paginated records from Spring Boot backend with dynamic sorting and search filtering.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Test rapid search typing with debounce and pagination transitions",
            description: "Apply 300ms debounce to search input and verify URL updates and backend requests fire without excessive redundant calls.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 55,
        title: "Frontend/backend integration testing and CORS",
        topic: "Frontend/backend integration testing and CORS",
        tasks: [
          {
            title: "Analyze full-stack debugging methodologies and network diagnostics",
            description: "Trace complete request lifecycles from browser network tab to Spring Boot filters, controllers, queries, and back to UI render.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Conduct comprehensive end-to-end user flow testing across frontend and backend",
            description: "Perform full flows: sign up -> sign in -> create item -> edit item -> list with filters -> delete item -> verify DB state.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Audit CORS headers and cookies in production build preview",
            description: "Run Vite preview build against Spring Boot backend and verify clean preflight checks, credentials, and security headers.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 56,
        title: "Task 8: Build a React dashboard for the Scholarship API",
        topic: "Task 8: Build a React dashboard for the Scholarship API. Deliverable: A complete React interface backed by Spring Boot.",
        tasks: [
          {
            title: "Architect Scholarship Dashboard UI components and user flows",
            description: "Design dashboard layout: applicant overview, scholarship catalog, application submission modal, and status tracking cards.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Implement complete React frontend connected to Scholarship Spring Boot API",
            description: "Build interactive dashboard allowing students to view eligible scholarships, apply with validation, and track application progress.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Verify Task 8 deliverable: full user walkthrough and edge case handling",
            description: "Walk through complete student submission flow, verify real-time status updates, and validate error messages for ineligible criteria.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
    ],
  },

  // WEEK 9
  {
    week: 9,
    title: "Week 9 — Major project: build (PaperScope)",
    description: "Open Research Collaboration Platform: Requirements, ER diagrams, Docker Compose, accounts, papers, citations, groups, experiments, and notes.",
    startingDay: 57,
    endingDay: 63,
    days: [
      {
        dayNumber: 57,
        title: "Finalize requirements, architecture, ER diagram",
        topic: "Finalize requirements, architecture, ER diagram (Open Research Collaboration Platform - PaperScope)",
        tasks: [
          {
            title: "Define PaperScope platform specifications and system requirements",
            description: "Finalize scope for 8 core modules: researcher profiles, paper discovery, research groups, experiments/datasets, notes, discussions, RBAC, search.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Design comprehensive relational ER diagram and database schema",
            description: "Map entities, primary keys, foreign keys, cardinality (1:N, N:M), unique indexes, and audit columns for all PaperScope tables.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Validate schema normalization and write Architectural Decision Record (ADR)",
            description: "Verify 3NF normalization, review citation graph indexing strategy, and document design decisions in `docs/architecture/ADR-001.md`.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 58,
        title: "Create repositories, project structure, Docker Compose",
        topic: "Create repositories, project structure, Docker Compose",
        tasks: [
          {
            title: "Structure monorepo / multi-module architecture for PaperScope",
            description: "Establish backend (Spring Boot 3) and frontend (React + Vite + Tailwind) directory structure, shared types, and build scripts.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Configure Docker Compose for full local development environment",
            description: "Set up Docker Compose with PostgreSQL 16, pgAdmin, and hot-reloading configurations for backend and frontend services.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Verify initial containerized stack boot and database migration",
            description: "Boot stack with `docker compose up`, verify database tables initialize cleanly, and test health actuator endpoints.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 59,
        title: "Implement accounts, profiles, and security",
        topic: "Implement accounts, profiles, and security",
        tasks: [
          {
            title: "Design PaperScope user domain and verified skill tags model",
            description: "Architect Researcher entity (id, email, passwordHash, fullName, institution, bio, orcid, verifiedSkills, role).",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Implement user authentication, registration, JWT security, and profile endpoints",
            description: "Build `/api/auth/register`, `/api/auth/login`, `/api/researchers/profile`, and skill tag management with role permissions.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Verify JWT authentication and profile updates with integration tests",
            description: "Write automated tests validating registration, token issuance, protected profile updates, and unauthenticated rejections.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 60,
        title: "Implement paper and citation modules",
        topic: "Implement paper and citation modules",
        tasks: [
          {
            title: "Design Paper discovery, metadata, and citation network graph schema",
            description: "Architect Paper (title, abstract, authors, doi, publishedDate, fileUrl) and self-referencing many-to-many Citation relationship.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Implement Paper CRUD, search indexing, and citation linking APIs",
            description: "Build endpoints to publish papers, query papers with full-text search, link cited papers, and fetch citation tree relationships.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Test citation graph queries and prevent circular citation anomalies",
            description: "Validate citation hierarchy queries, ensure paper cannot cite itself, and benchmark citation count aggregation queries.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 61,
        title: "Implement research groups and membership",
        topic: "Implement research groups and membership",
        tasks: [
          {
            title: "Architect Research Group domain model and multi-tier membership roles",
            description: "Design ResearchGroup (name, description, visibility: PUBLIC/PRIVATE) and GroupMember (role: OWNER, ADMIN, MEMBER, VIEWER).",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Implement group creation, invite workflows, and role-based permissions",
            description: "Build endpoints to create groups, invite researchers, accept invites, change roles, and enforce group-level authorization.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Test group authorization boundaries and privacy access controls",
            description: "Verify private groups are hidden from non-members and only group owners/admins can approve members or modify group settings.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 62,
        title: "Implement experiments, datasets, and result records",
        topic: "Implement experiments, datasets, and result records",
        tasks: [
          {
            title: "Design Experiment tracking and reproducible result data models",
            description: "Architect Experiment (title, hypothesis, parametersJson, status), Dataset (name, fileUrl, checksum), and ResultRecord (metricsJson, outputUrl).",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Implement experiment execution logging and dataset association APIs",
            description: "Build endpoints for researchers to log experiment runs, attach dataset metadata, record execution metrics, and compare runs.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Verify experiment metrics storage and structured comparison queries",
            description: "Log multiple experiment iterations, query runs by group, and verify JSON metrics serialization and reproducible output records.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 63,
        title: "Implement notes, attachments, and discussions",
        topic: "Implement notes, attachments, and discussions",
        tasks: [
          {
            title: "Design Versioned Research Notes and threaded discussion architecture",
            description: "Architect ResearchNote (version, contentMarkdown, isPublished), Attachment (fileKey, size), and DiscussionThread with Comment tree.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Implement versioned note editing, file upload attachments, and discussions",
            description: "Build endpoints for saving note revisions, uploading supplementary data files, creating discussion threads, and replying to comments.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Test note versioning history and threaded discussions",
            description: "Edit research note across 3 revisions, verify complete revision history is retrievable, and test threaded comment ordering.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
    ],
  },

  // WEEK 10
  {
    week: 10,
    title: "Week 10 — Major project: finish and deploy",
    description: "PaperScope React UI, paper discovery, dashboards, API integration, testing, Docker Compose, deployment, and resume preparation.",
    startingDay: 64,
    endingDay: 70,
    days: [
      {
        dayNumber: 64,
        title: "React authentication, layout, navigation",
        topic: "React authentication, layout, navigation (PaperScope Frontend)",
        tasks: [
          {
            title: "Design PaperScope application layout, navigation shell, and theme",
            description: "Build responsive top header, sidebar navigation, dark/light theme switcher, and researcher profile badge.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Implement Login, Register, and Researcher Profile management views",
            description: "Create authentication screens with form validation, token storage, and protected route wrappers for private pages.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Verify authentication lifecycle and session persistence in browser",
            description: "Log in, refresh page, confirm session persists via JWT, and verify logout clears state and redirects cleanly.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 65,
        title: "Paper discovery and paper-detail pages",
        topic: "Paper discovery and paper-detail pages",
        tasks: [
          {
            title: "Design Paper Discovery feed and citation exploration interface",
            description: "Create UI wireframes for search/filter toolbar, paper cards with citation metrics, and interactive citation list view.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Implement Paper Discovery page and rich Paper Details view",
            description: "Build search feed with debounced query filtering, DOI linking, abstract viewer, citation graph display, and PDF download button.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Test search filtering and citation link navigation",
            description: "Search papers by keywords, verify rapid rendering, click cited papers to navigate directly to paper detail pages.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 66,
        title: "Research group and experiment dashboards",
        topic: "Research group and experiment dashboards",
        tasks: [
          {
            title: "Design Research Group collaboration hub and experiment dashboard layouts",
            description: "Structure group overview, member roster, experiment timeline, and metrics visualization cards.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Implement Group management and Experiment dashboard components",
            description: "Build views to create groups, manage memberships, log new experiment runs, and display metrics tables with status tags.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Verify group creation and experiment tracking end-to-end in UI",
            description: "Create a new research group in browser, invite a peer, log 3 experiment runs, and verify realtime state updates.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 67,
        title: "Connect all remaining APIs; add notifications",
        topic: "Connect all remaining APIs; add notifications",
        tasks: [
          {
            title: "Map remaining backend endpoints: notes, attachments, discussions, and notifications",
            description: "Audit frontend API coverage ensuring every backend route has corresponding client service methods and error handling.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Implement versioned notes editor, discussion comment feed, and notification toast system",
            description: "Integrate Markdown editor for research notes, add comment thread component, and build notification toast alerts for group invites.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Conduct full-stack smoke testing of all integrated modules",
            description: "Verify notes save and render Markdown, comments post instantly, and notification dropdown reflects recent group activities.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 68,
        title: "Backend tests, validation, security checks, bug fixes",
        topic: "Backend tests, validation, security checks, bug fixes",
        tasks: [
          {
            title: "Execute comprehensive security audit and vulnerability scan",
            description: "Review OWASP top 10 risks: SQL injection, broken authorization, sensitive data exposure, and security header configurations.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Add missing unit/integration tests and resolve edge case bugs",
            description: "Write targeted tests for edge cases, fix null pointer risks, tighten validation constraints, and optimize slow database queries.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Verify complete test suite passes with zero regressions",
            description: "Run `./mvnw clean verify` and frontend test suite, confirming 100% test pass rate and clean build outputs.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 69,
        title: "Docker Compose, deployment, environment configuration",
        topic: "Docker Compose, deployment, environment configuration",
        tasks: [
          {
            title: "Plan production deployment topology and environment configuration",
            description: "Prepare production environment variables, reverse proxy (Nginx) setup, SSL certificate termination, and cloud database pooling.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Assemble production docker-compose.prod.yml and deployment configurations",
            description: "Configure multi-container production build with healthchecks, restart policies, resource limits, and automated database backups.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Deploy application stack to cloud host (Render / Railway / VPS)",
            description: "Deploy backend, database, and frontend; verify health checks, environment secrets injection, and public domain resolution.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
      {
        dayNumber: 70,
        title: "README, architecture diagram, API documentation, demo video, resume bullets",
        topic: "README, architecture diagram, API documentation, demo video, resume bullets create a checklist for this",
        tasks: [
          {
            title: "Draft comprehensive README.md with system architecture diagrams",
            description: "Include project overview, architecture diagram, tech stack badges, local setup instructions, environment config guide, and live links.",
            taskType: "learn",
            estimatedDuration: 30,
          },
          {
            title: "Generate interactive OpenAPI documentation and record 3-minute video walkthrough",
            description: "Export Swagger documentation and record demo video showcasing paper discovery, research groups, and experiment tracking.",
            taskType: "code",
            estimatedDuration: 40,
          },
          {
            title: "Formulate quantifiable resume bullet points highlighting engineering achievements",
            description: "Draft 4 impact-focused resume bullets highlighting Spring Boot 3, JPA optimization, JWT RBAC security, Docker, and full-stack integration.",
            taskType: "practice",
            estimatedDuration: 20,
          },
        ],
      },
    ],
  },
];

// Generate curriculum-java-spring.js
let fileContent = `// Generator for Java + Spring Boot Curriculum (70 Days, 10 Modules, 210 Tasks)
// Populated verbatim with exact 10-week syllabus, daily deliverables, and PaperScope major capstone project.

export const javaModules = [\n`;

springBootCurriculum.forEach((mod, idx) => {
  fileContent += `  {
    title: ${JSON.stringify(mod.title)},
    description: ${JSON.stringify(mod.description)},
    startingDay: ${mod.startingDay},
    endingDay: ${mod.endingDay},
    displayOrder: ${idx + 1},
  },\n`;
});

fileContent += `];\n\nexport const dayDefinitions = [\n`;

springBootCurriculum.forEach((mod, modIdx) => {
  mod.days.forEach((d) => {
    fileContent += `  {
    dayNumber: ${d.dayNumber},
    moduleIndex: ${modIdx},
    title: ${JSON.stringify(d.title)},
    objective: ${JSON.stringify(d.topic)},
    tasks: [\n`;
    d.tasks.forEach((t) => {
      fileContent += `      { title: ${JSON.stringify(t.title)}, desc: ${JSON.stringify(t.description)}, type: ${JSON.stringify(t.taskType)}, dur: ${t.estimatedDuration} },\n`;
    });
    fileContent += `    ],
  },\n`;
  });
});

fileContent += `];\n\nexport const generateJavaSpringCurriculum = () => {
  return {
    modules: javaModules,
    days: dayDefinitions,
  };
};\n`;

fs.writeFileSync('C:/Users/krkts/.gemini/antigravity/scratch/devpath/backend/prisma/data/curriculum-java-spring.js', fileContent);
console.log('Successfully wrote curriculum-java-spring.js with 10 modules and 70 days!');
