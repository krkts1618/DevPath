// Generator for Java + Spring Boot Curriculum (70 Days, 10 Modules)

const javaModules = [
  {
    title: 'Module 1: Spring Boot Fundamentals & REST Controllers',
    description: 'Spring Initializr, Maven build lifecycle, IoC container, dependency injection, beans, and building the Campus Event Discovery API.',
    startingDay: 1,
    endingDay: 7,
    displayOrder: 1,
  },
  {
    title: 'Module 2: Layered Architecture, DTOs & Response Modeling',
    description: 'Controller-Service-Repository separation of concerns, DTO mapping, ResponseEntity, and Personal Finance Rules API.',
    startingDay: 8,
    endingDay: 14,
    displayOrder: 2,
  },
  {
    title: 'Module 3: Spring Data JPA, Hibernate & Entity Relationships',
    description: 'JPA entity mapping, 1:1, 1:N, N:M associations, fetch types, JPQL queries, pagination, and Research Paper & Citation API.',
    startingDay: 15,
    endingDay: 21,
    displayOrder: 3,
  },
  {
    title: 'Module 4: Validation, Exception Handling & Transactions',
    description: 'Jakarta Bean Validation, @ControllerAdvice global handlers, @Transactional boundaries, and Scholarship Eligibility API.',
    startingDay: 22,
    endingDay: 28,
    displayOrder: 4,
  },
  {
    title: 'Module 5: Testing with JUnit 5, Mockito & MockMvc & OpenAPI',
    description: 'Service unit tests, repository tests, MockMvc controller integration tests, Spring profiles, logging, and Swagger docs.',
    startingDay: 29,
    endingDay: 35,
    displayOrder: 5,
  },
  {
    title: 'Module 6: Spring Security 6 & JWT Authentication',
    description: 'Security filter chains, BCrypt password hashing, stateless JWT generation & verification, RBAC, and Skill-Swap API.',
    startingDay: 36,
    endingDay: 42,
    displayOrder: 6,
  },
  {
    title: 'Module 7: Advanced Enterprise Features: Files, Mail, Redis & Docker',
    description: 'Multipart file uploads, Spring Mail integration, Redis caching (@Cacheable/@CacheEvict), and containerization.',
    startingDay: 43,
    endingDay: 49,
    displayOrder: 7,
  },
  {
    title: 'Module 8: Full-Stack Integration: React + Spring Boot',
    description: 'Connecting React frontend with Spring backend, CORS configuration, Axios interceptors, JWT handling, and Scholarship Dashboard.',
    startingDay: 50,
    endingDay: 56,
    displayOrder: 8,
  },
  {
    title: 'Module 9: Enterprise Platform Backend: Open Research Collaboration',
    description: 'Workspaces, multi-user research projects, document versions, role permissions, and scalable PostgreSQL persistence.',
    startingDay: 57,
    endingDay: 63,
    displayOrder: 9,
  },
  {
    title: 'Module 10: Capstone Delivery, Deployment, Testing & Interview Readiness',
    description: 'Full-stack integration, containerized deployment, CI/CD, architecture diagrams, Swagger documentation, and resume prep.',
    startingDay: 64,
    endingDay: 70,
    displayOrder: 10,
  },
];

const dayDefinitions = [
  // Module 1: Days 1-7
  {
    dayNumber: 1,
    moduleIndex: 0,
    title: 'Spring Boot Architecture & Spring Initializr Setup',
    objective: 'Generate project using Spring Initializr, explore pom.xml, and understand the @SpringBootApplication bootstrap process.',
    tasks: [
      { title: 'Explore Spring Boot philosophy and opinionated defaults', desc: 'Understand auto-configuration, embedded Tomcat, and starter dependencies.', type: 'learn', dur: 30 },
      { title: 'Generate Spring Boot project using Spring Initializr', desc: 'Include Spring Web, Lombok, and Spring Boot DevTools dependencies.', type: 'code', dur: 30 },
      { title: 'Inspect Maven pom.xml and @SpringBootApplication entry point', desc: 'Trace @Configuration, @EnableAutoConfiguration, and @ComponentScan annotations.', type: 'practice', dur: 30 },
    ],
  },
  {
    dayNumber: 2,
    moduleIndex: 0,
    title: 'Inversion of Control (IoC) & Dependency Injection (DI)',
    objective: 'Master Spring IoC container, compare constructor vs field injection, and understand @Component stereotyping.',
    tasks: [
      { title: 'Study Inversion of Control and Dependency Injection theory', desc: 'Analyze how Spring container manages object lifecycles and decouples dependencies.', type: 'learn', dur: 30 },
      { title: 'Implement constructor injection using Lombok @RequiredArgsConstructor', desc: 'Demonstrate why constructor injection promotes immutability and testability.', type: 'code', dur: 30 },
      { title: 'Contrast constructor injection against field injection (@Autowired)', desc: 'Document circular dependency traps and null-pointer hazards of field injection.', type: 'practice', dur: 30 },
    ],
  },
  {
    dayNumber: 3,
    moduleIndex: 0,
    title: 'Spring Beans, Configuration Classes & ApplicationContext',
    objective: 'Define explicit beans with @Configuration and @Bean, and analyze bean scopes.',
    tasks: [
      { title: 'Define Spring Beans using @Configuration and @Bean', desc: 'Configure third-party class beans programmatically in a dedicated AppConfig class.', type: 'code', dur: 30 },
      { title: 'Study Spring Bean Scopes: Singleton vs Prototype', desc: 'Verify bean identity hash codes for singleton (default) vs prototype scoped beans.', type: 'code', dur: 30 },
      { title: 'Inspect ApplicationContext beans programmatically', desc: 'Use CommandLineRunner to list all active Spring beans loaded at startup.', type: 'practice', dur: 30 },
    ],
  },
  {
    dayNumber: 4,
    moduleIndex: 0,
    title: 'REST Controllers & HTTP Request Mapping',
    objective: 'Create REST controllers with @RestController and map GET, POST, PUT, DELETE endpoints.',
    tasks: [
      { title: 'Understand @RestController vs @Controller architecture', desc: 'Learn how @ResponseBody automatically serializes Java return objects to JSON.', type: 'learn', dur: 30 },
      { title: 'Map HTTP verbs using @GetMapping, @PostMapping, @PutMapping, @DeleteMapping', desc: 'Define clean REST endpoint URLs following resource naming conventions.', type: 'code', dur: 30 },
      { title: 'Test basic endpoints using cURL or Postman collection', desc: 'Send requests and inspect HTTP status codes and JSON payloads.', type: 'practice', dur: 30 },
    ],
  },
  {
    dayNumber: 5,
    moduleIndex: 0,
    title: 'Handling Parameters: @RequestParam & @PathVariable',
    objective: 'Extract query parameters and dynamic path segments from incoming HTTP requests.',
    tasks: [
      { title: 'Extract query parameters with @RequestParam', desc: 'Configure required flags, default values, and handle missing parameters gracefully.', type: 'code', dur: 30 },
      { title: 'Extract dynamic URI segments using @PathVariable', desc: 'Handle path variables (e.g., /api/events/{id}) with proper type conversions.', type: 'code', dur: 30 },
      { title: 'Combine path variables and query filters in a single search endpoint', desc: 'Build an endpoint filtering items by category path and pagination query params.', type: 'practice', dur: 30 },
    ],
  },
  {
    dayNumber: 6,
    moduleIndex: 0,
    title: 'Request Bodies (@RequestBody) & Jackson JSON Serialization',
    objective: 'Deserialize JSON payloads into Java POJOs using Jackson and leverage Lombok annotations.',
    tasks: [
      { title: 'Handle incoming JSON payloads using @RequestBody', desc: 'Map request body to strongly-typed Java class using Jackson object mapper.', type: 'code', dur: 30 },
      { title: 'Integrate Lombok annotations (@Data, @Builder, @NoArgsConstructor)', desc: 'Reduce boilerplate getter, setter, constructor, and toString methods.', type: 'code', dur: 30 },
      { title: 'Configure Jackson serialization options in application.properties', desc: 'Format timestamps as ISO-8601 strings and omit null fields in JSON responses.', type: 'practice', dur: 30 },
    ],
  },
  {
    dayNumber: 7,
    moduleIndex: 0,
    title: 'Mini-Project: Campus Event Discovery REST API',
    objective: 'Build, test, and document a complete in-memory Campus Event Discovery REST API.',
    tasks: [
      { title: 'Design Event model (id, title, description, venue, date, category)', desc: 'Create model class with unique ID generation and validation.', type: 'code', dur: 25 },
      { title: 'Implement full CRUD REST endpoints for Campus Events', desc: 'Implement GET all, GET by id, POST create, PUT update, and DELETE event.', type: 'project', dur: 45 },
      { title: 'Export Postman test collection with sample requests', desc: 'Verify all endpoints return expected status codes and valid JSON.', type: 'practice', dur: 20 },
    ],
  },

  // Module 2: Days 8-14
  {
    dayNumber: 8,
    moduleIndex: 1,
    title: 'Layered Architecture Principles & Separation of Concerns',
    objective: 'Understand Controller, Service, and Repository layers and structure a clean Spring Boot project.',
    tasks: [
      { title: 'Study 3-Tier Layered Architecture principles', desc: 'Analyze Controller (presentation), Service (business logic), Repository (data access).', type: 'learn', dur: 30 },
      { title: 'Scaffold layered package hierarchy in Spring Boot project', desc: 'Create controller, service, repository, model, dto, and exception packages.', type: 'code', dur: 30 },
      { title: 'Trace request flow through layers with logging', desc: 'Follow incoming HTTP request down through controller to service to repository.', type: 'practice', dur: 30 },
    ],
  },
  {
    dayNumber: 9,
    moduleIndex: 1,
    title: 'Controller Layer Implementation & HTTP Decoupling',
    objective: 'Build thin controllers delegating all business logic to service interfaces.',
    tasks: [
      { title: 'Implement thin REST controllers without business logic', desc: 'Delegate incoming requests directly to service layer methods.', type: 'code', dur: 30 },
      { title: 'Return explicit HTTP status codes using ResponseEntity', desc: 'Use HttpStatus.CREATED, OK, NO_CONTENT, NOT_FOUND appropriately.', type: 'code', dur: 30 },
      { title: 'Add custom response headers in ResponseEntity', desc: 'Include custom headers such as Location or X-Total-Count in responses.', type: 'practice', dur: 30 },
    ],
  },
  {
    dayNumber: 10,
    moduleIndex: 1,
    title: 'Service Layer Implementation & Business Logic Validation',
    objective: 'Implement service interfaces and classes enforcing domain validation and business rules.',
    tasks: [
      { title: 'Create Service interfaces and @Service implementation classes', desc: 'Define business contract interfaces and inject them into controllers.', type: 'code', dur: 30 },
      { title: 'Implement domain validation rules in service methods', desc: 'Verify business constraints (e.g., event dates must be in the future).', type: 'code', dur: 30 },
      { title: 'Throw custom business exceptions when validations fail', desc: 'Throw domain-specific exceptions (e.g., ResourceNotFoundException).', type: 'practice', dur: 30 },
    ],
  },
  {
    dayNumber: 11,
    moduleIndex: 1,
    title: 'Repository Layer Abstraction & In-Memory Storage',
    objective: 'Create @Repository interfaces and classes managing in-memory entity persistence.',
    tasks: [
      { title: 'Define Repository interface with standard CRUD method signatures', desc: 'Specify findById, findAll, save, and deleteById methods.', type: 'code', dur: 30 },
      { title: 'Implement thread-safe in-memory repository with ConcurrentHashMap', desc: 'Simulate database persistence with thread-safe collections.', type: 'code', dur: 30 },
      { title: 'Connect Controller -> Service -> Repository layer chain', desc: 'Verify end-to-end data flow with dependency injection across all three layers.', type: 'practice', dur: 30 },
    ],
  },
  {
    dayNumber: 12,
    moduleIndex: 1,
    title: 'Data Transfer Object (DTO) Pattern & Model Mapping',
    objective: 'Decouple internal entities from API contracts using Request and Response DTOs.',
    tasks: [
      { title: 'Study DTO pattern benefits and security considerations', desc: 'Prevent mass assignment vulnerabilities and avoid exposing internal database IDs.', type: 'learn', dur: 30 },
      { title: 'Create RequestDTO and ResponseDTO classes with records', desc: 'Use modern Java records for immutable data transfer representations.', type: 'code', dur: 30 },
      { title: 'Write mapper methods or integrate MapStruct for model-to-DTO conversion', desc: 'Map between entity models and DTO representations cleanly.', type: 'practice', dur: 30 },
    ],
  },
  {
    dayNumber: 13,
    moduleIndex: 1,
    title: 'Standardized API Response Wrappers & Error Structures',
    objective: 'Build uniform ApiResponse<T> wrapper with timestamp, status, message, and data.',
    tasks: [
      { title: 'Design generic ApiResponse<T> envelope class', desc: 'Include boolean success, String message, T data, and Instant timestamp.', type: 'code', dur: 30 },
      { title: 'Refactor all controller endpoints to return ApiResponse<T>', desc: 'Ensure consistent response structure across all successful endpoints.', type: 'code', dur: 30 },
      { title: 'Design ApiErrorResponse class for error payloads', desc: 'Include status code, error message, timestamp, and optional validation error map.', type: 'practice', dur: 30 },
    ],
  },
  {
    dayNumber: 14,
    moduleIndex: 1,
    title: 'Mini-Project: Personal Finance Rules REST API',
    objective: 'Implement full Controller-Service-Repository architecture for Personal Finance Rules API.',
    tasks: [
      { title: 'Design BudgetRule entity and CreateRuleRequest / RuleResponse DTOs', desc: 'Model category, limitAmount, period, and alertThreshold.', type: 'code', dur: 25 },
      { title: 'Implement layered CRUD with business rule validation', desc: 'Prevent duplicate categories and enforce limitAmount > 0.', type: 'project', dur: 45 },
      { title: 'Test all endpoints in Postman and export collection', desc: 'Verify status 201 on create, 200 on read, 404 on invalid ID, and 204 on delete.', type: 'practice', dur: 20 },
    ],
  },

  // Module 3: Days 15-21: JPA & Hibernate
  {
    dayNumber: 15,
    moduleIndex: 2,
    title: 'JDBC vs JPA & Hibernate Architecture Overview',
    objective: 'Compare raw JDBC with JPA/Hibernate ORM and configure Spring Data JPA with PostgreSQL.',
    tasks: [
      { title: 'Compare JDBC, Hibernate ORM, and Spring Data JPA abstraction levels', desc: 'Understand Object-Relational Mapping, entity states, and persistence context.', type: 'learn', dur: 30 },
      { title: 'Configure PostgreSQL datasource and HikariCP connection pool', desc: 'Set up spring.datasource.url, username, password, and ddl-auto in application.yml.', type: 'code', dur: 30 },
      { title: 'Enable SQL query logging and formatting in development', desc: 'Configure show-sql: true and format_sql: true to inspect Hibernate queries.', type: 'practice', dur: 30 },
    ],
  },
  {
    dayNumber: 16,
    moduleIndex: 2,
    title: 'JPA Entity Lifecycle & Basic Annotations',
    objective: 'Map Java classes to database tables with @Entity, @Table, @Id, @GeneratedValue, and @Column.',
    tasks: [
      { title: 'Study JPA Entity Lifecycle states: Transient, Managed, Detached, Removed', desc: 'Understand how EntityManager tracks entity modifications and triggers dirty checks.', type: 'learn', dur: 30 },
      { title: 'Map persistent entity with primary key generation strategies', desc: 'Use GenerationType.IDENTITY or GenerationType.SEQUENCE with @Column constraints.', type: 'code', dur: 30 },
      { title: 'Add audit timestamps using Spring Data JPA auditing (@CreatedDate)', desc: 'Automatically populate createdAt and updatedAt with @EntityListeners.', type: 'practice', dur: 30 },
    ],
  },
  {
    dayNumber: 17,
    moduleIndex: 2,
    title: 'One-to-One and One-to-Many Relationships',
    objective: 'Implement @OneToOne and @OneToMany bidirectional associations with cascade options.',
    tasks: [
      { title: 'Implement @OneToOne relationship with shared primary key or foreign key', desc: 'Map User to UserProfile using @JoinColumn and cascade types.', type: 'code', dur: 30 },
      { title: 'Implement @OneToMany and @ManyToOne bidirectional relationship', desc: 'Map Category to Products using mappedBy attribute on the inverse side.', type: 'code', dur: 30 },
      { title: 'Configure CascadeType (ALL, PERSIST, MERGE) and orphanRemoval', desc: 'Verify child entities are automatically saved or removed with parent.', type: 'practice', dur: 30 },
    ],
  },
  {
    dayNumber: 18,
    moduleIndex: 2,
    title: 'Many-to-Many Relationships & Junction Tables',
    objective: 'Implement @ManyToMany relationships with @JoinTable and composite keys.',
    tasks: [
      { title: 'Implement @ManyToMany association between Student and Course', desc: 'Configure @JoinTable with joinColumns and inverseJoinColumns.', type: 'code', dur: 30 },
      { title: 'Refactor ManyToMany to intermediate entity with extra columns', desc: 'Create Enrollment entity with @EmbeddedId for registration date and grade.', type: 'code', dur: 30 },
      { title: 'Verify junction table creation and test join queries', desc: 'Insert associated entities and inspect generated foreign key joins.', type: 'practice', dur: 30 },
    ],
  },
  {
    dayNumber: 19,
    moduleIndex: 2,
    title: 'Lazy vs Eager Loading & N+1 Query Problem in JPA',
    objective: 'Analyze FetchType.LAZY vs EAGER and eliminate N+1 select queries using JOIN FETCH.',
    tasks: [
      { title: 'Study LazyInitializationException and FetchType trade-offs', desc: 'Learn why FetchType.LAZY is standard practice for collections.', type: 'learn', dur: 30 },
      { title: 'Reproduce N+1 query problem with default lazy collections', desc: 'Observe N separate queries executed when looping over parent entities in logs.', type: 'code', dur: 30 },
      { title: 'Solve N+1 queries using @Query("SELECT p FROM Parent p JOIN FETCH p.children")', desc: 'Execute single join query and verify log shows exactly one database query.', type: 'practice', dur: 30 },
    ],
  },
  {
    dayNumber: 20,
    moduleIndex: 2,
    title: 'Spring Data Repositories, Derived Queries & JPQL',
    objective: 'Write derived query methods, custom JPQL queries, and native SQL queries in JpaRepository.',
    tasks: [
      { title: 'Extend JpaRepository<Entity, ID> and use built-in methods', desc: 'Use findById, saveAll, count, and existsById without writing implementation.', type: 'code', dur: 30 },
      { title: 'Write derived query methods (findByTitleContainingIgnoreCase)', desc: 'Leverage Spring Data method naming conventions for automatic query generation.', type: 'code', dur: 30 },
      { title: 'Write custom JPQL queries with @Query and named parameters (@Param)', desc: 'Execute database-independent queries referencing entity attribute names.', type: 'practice', dur: 30 },
    ],
  },
  {
    dayNumber: 21,
    moduleIndex: 2,
    title: 'Pagination, Sorting & Research Paper & Citation API',
    objective: 'Implement Pageable and Sort in repositories and build the Research Paper & Citation API.',
    tasks: [
      { title: 'Add Pageable and Sort support in Spring Data JPA repository', desc: 'Return Page<Entity> with totalPages, totalElements, and hasNext metadata.', type: 'code', dur: 25 },
      { title: 'Build Research Paper & Citation REST API with JPA relationships', desc: 'Model Paper and Citation entities with bidirectional self-referencing relationship.', type: 'project', dur: 45 },
      { title: 'Test paginated citation retrieval and verify SQL offset/limit', desc: 'Confirm Hibernate generates LIMIT and OFFSET in PostgreSQL console.', type: 'practice', dur: 20 },
    ],
  },

  // Module 4: Days 22-28: Validation, Exceptions, Transactions
  {
    dayNumber: 22,
    moduleIndex: 3,
    title: 'Jakarta Bean Validation Annotations',
    objective: 'Validate incoming DTOs using Jakarta validation constraints on controller request bodies.',
    tasks: [
      { title: 'Study Bean Validation annotations: @NotNull, @NotEmpty, @NotBlank, @Size', desc: 'Learn constraint differences and appropriate usage for strings, numbers, and collections.', type: 'learn', dur: 30 },
      { title: 'Add @Valid and @Validated on controller @RequestBody DTOs', desc: 'Trigger automatic validation upon receiving HTTP payloads.', type: 'code', dur: 30 },
      { title: 'Validate numeric ranges (@Min, @Max) and pattern regex (@Pattern)', desc: 'Enforce strict formatting on phone numbers, postal codes, and monetary amounts.', type: 'practice', dur: 30 },
    ],
  },
  {
    dayNumber: 23,
    moduleIndex: 3,
    title: 'Custom Validation Annotations & Validators',
    objective: 'Create custom ConstraintValidator to enforce business validation logic.',
    tasks: [
      { title: 'Create custom validation annotation (e.g., @ValidPhoneNumber)', desc: 'Define @Constraint, @Target, and @Retention annotations.', type: 'code', dur: 30 },
      { title: 'Implement ConstraintValidator<Annotation, FieldType> interface', desc: 'Write isValid method containing domain validation logic.', type: 'code', dur: 30 },
      { title: 'Test custom validator with valid and invalid payloads', desc: 'Verify custom validation message is returned when constraint is violated.', type: 'practice', dur: 30 },
    ],
  },
  {
    dayNumber: 24,
    moduleIndex: 3,
    title: 'Global Exception Handling with @ControllerAdvice',
    objective: 'Implement centralized @RestControllerAdvice catching and formatting application exceptions.',
    tasks: [
      { title: 'Create @RestControllerAdvice global exception handler class', desc: 'Intercept exceptions thrown across all controllers in a centralized location.', type: 'code', dur: 30 },
      { title: 'Handle MethodArgumentNotValidException for validation errors', desc: 'Extract field error names and messages into a clean Map<String, String>.', type: 'code', dur: 30 },
      { title: 'Return standardized ErrorResponse with timestamp, status, and error details', desc: 'Ensure client always receives predictable JSON structure on any failure.', type: 'practice', dur: 30 },
    ],
  },
  {
    dayNumber: 25,
    moduleIndex: 3,
    title: 'Custom Application Exceptions Hierarchy',
    objective: 'Design domain exception hierarchy (ResourceNotFound, DuplicateResource, BadRequest).',
    tasks: [
      { title: 'Create BaseApplicationException and specific domain subclasses', desc: 'Create ResourceNotFoundException, DuplicateResourceException, and UnauthorizedException.', type: 'code', dur: 30 },
      { title: 'Add specific @ExceptionHandler methods for domain exceptions', desc: 'Map ResourceNotFoundException to HTTP 404 and DuplicateResource to HTTP 409.', type: 'code', dur: 30 },
      { title: 'Handle unhandled exceptions with generic 500 Internal Server Error', desc: 'Log stack trace internally while returning safe error message to client.', type: 'practice', dur: 30 },
    ],
  },
  {
    dayNumber: 26,
    moduleIndex: 3,
    title: 'Transaction Management with @Transactional',
    objective: 'Understand Spring transaction management, ACID guarantees, and proxy mechanics.',
    tasks: [
      { title: 'Study @Transactional mechanics and Spring AOP proxies', desc: 'Understand why calling a @Transactional method from within the same class bypasses proxy.', type: 'learn', dur: 30 },
      { title: 'Configure rollback rules: rollbackFor = Exception.class', desc: 'Ensure transactions roll back on checked exceptions, not just unchecked RuntimeExceptions.', type: 'code', dur: 30 },
      { title: 'Test atomic multi-table rollback upon simulated failure', desc: 'Verify no partial records remain in database when exception is thrown midway.', type: 'practice', dur: 30 },
    ],
  },
  {
    dayNumber: 27,
    moduleIndex: 3,
    title: 'Transaction Propagation & Isolation in Spring',
    objective: 'Configure transaction propagation (REQUIRED, REQUIRES_NEW) and read-only optimizations.',
    tasks: [
      { title: 'Study Propagation levels: REQUIRED, REQUIRES_NEW, MANDATORY, SUPPORTS', desc: 'Analyze when a new independent transaction must be started (e.g., audit logging).', type: 'learn', dur: 30 },
      { title: 'Configure @Transactional(readOnly = true) for query methods', desc: 'Enable Hibernate dirty-checking optimization on read-only transactions.', type: 'code', dur: 30 },
      { title: 'Demonstrate REQUIRES_NEW for audit log persistence on transaction failure', desc: 'Ensure security audit logs persist even when the main business transaction aborts.', type: 'practice', dur: 30 },
    ],
  },
  {
    dayNumber: 28,
    moduleIndex: 3,
    title: 'Mini-Project: Scholarship Eligibility API with Transactions',
    objective: 'Build layered Scholarship Eligibility API with validation, global exceptions, and transactions.',
    tasks: [
      { title: 'Design ScholarshipApplication entity and DTOs with validation constraints', desc: 'Validate GPA ranges, family income limits, and applicant details.', type: 'code', dur: 25 },
      { title: 'Implement transactional application evaluation service', desc: 'Evaluate eligibility, assign scholarship tier, update budget, and record audit log.', type: 'project', dur: 45 },
      { title: 'Test error flows with invalid inputs and verify 422 and 404 responses', desc: 'Confirm validation errors return structured map of field failures.', type: 'practice', dur: 20 },
    ],
  },
];

// Helper to fill remaining modules for 70 days
for (let d = 29; d <= 70; d++) {
  const modIdx = Math.floor((d - 1) / 7);
  const titles = [
    'Unit Testing, Mockito & OpenAPI Documentation', // Mod 5 (29-35)
    'Spring Security 6, BCrypt & JWT Authentication', // Mod 6 (36-42)
    'Enterprise Features: Files, Mail, Redis Caching & Docker', // Mod 7 (43-49)
    'React + Spring Boot Full-Stack Integration', // Mod 8 (50-56)
    'Research Collaboration Platform: Domain & Architecture', // Mod 9 (57-63)
    'Capstone Delivery, CI/CD, Deployment & Career Readiness', // Mod 10 (64-70)
  ];
  const modTitle = titles[modIdx - 4] || 'Advanced Spring Boot Engineering';

  dayDefinitions.push({
    dayNumber: d,
    moduleIndex: modIdx,
    title: `Day ${d}: ${modTitle} - Part ${(d - 1) % 7 + 1}`,
    objective: `Master advanced Spring Boot topic for Day ${d} in ${modTitle}.`,
    tasks: [
      {
        title: `Study concepts and architecture for Day ${d}`,
        desc: `Learn theoretical foundations and enterprise design patterns for Day ${d} curriculum.`,
        type: 'learn',
        dur: 30,
      },
      {
        title: `Implement core functionality and write unit tests for Day ${d}`,
        desc: `Code practical Spring Boot service, configuration, or controller methods and verify execution.`,
        type: 'code',
        dur: 35,
      },
      {
        title: `Execute integration testing and review logs for Day ${d}`,
        desc: `Test API endpoints, verify database persistence, and document progress in engineering log.`,
        type: d % 7 === 0 ? 'project' : 'practice',
        dur: 25,
      },
    ],
  });
}

export const javaSpringCurriculum = {
  roadmapSlug: 'java-spring-boot',
  modules: javaModules,
  days: dayDefinitions.map((d) => ({
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
