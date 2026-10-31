import axios from 'axios';

const API = 'http://localhost:5000/api';

async function seedData() {
  console.log('Seeding rich notes, revisions, and projects...');

  const rmRes = await axios.get(`${API}/roadmaps`);
  const roadmaps = rmRes.data?.data?.roadmaps || rmRes.data?.data || [];
  const javaRoadmap = roadmaps.find((r) => r.title.includes('Java')) || roadmaps[0];
  const dbRoadmap = roadmaps.find((r) => r.title.includes('Database')) || roadmaps[1] || roadmaps[0];

  // 1. Seed Notes
  const n1 = await axios.post(`${API}/notes`, {
    title: 'PostgreSQL Query Planner & B-Tree Index Mechanics',
    content: `# PostgreSQL B-Tree Index Internals

Understanding how PostgreSQL executes query plans through cost estimation and index scans.

### B-Tree Leaf Structure
- High fan-out nodes (approx 200-500 keys per page)
- Doubly-linked leaf pages enable fast range scans: \`WHERE created_at BETWEEN x AND y\`
- Deduplication in Postgres 13+ reduces index bloat significantly

\`\`\`sql
-- Index scan analysis
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, title, status 
FROM tasks 
WHERE roadmap_day_id = 'c7e5a8bc-69cb-4c27-9952-b1fa7a2efcb3'
ORDER BY display_order ASC;
\`\`\`

> **Key Rule**: Avoid functional transformations on indexed columns (e.g. \`WHERE LOWER(email) = ...\`) unless an expression index is defined.`,
    roadmapId: dbRoadmap?.id,
    tags: ['postgresql', 'database', 'indexing', 'performance'],
  });
  await axios.patch(`${API}/notes/${n1.data.data.id}/favorite`);
  await axios.patch(`${API}/notes/${n1.data.data.id}/pin`);

  const n2 = await axios.post(`${API}/notes`, {
    title: 'Spring Security 6 Architecture & JWT Filter Chain',
    content: `# Spring Security 6 Deep Dive

The filter chain intercepts requests before they hit controllers.

1. **SecurityFilterChain Bean**: Replaces legacy \`WebSecurityConfigurerAdapter\`
2. **OncePerRequestFilter**: Custom \`JwtAuthenticationFilter\`
3. **SecurityContextHolder**: ThreadLocal storage for \`Authentication\` object

\`\`\`java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }
}
\`\`\`

- Token validation ensures stateless microservices authentication.`,
    roadmapId: javaRoadmap?.id,
    tags: ['java', 'spring-boot', 'security', 'jwt'],
  });
  await axios.patch(`${API}/notes/${n2.data.data.id}/favorite`);

  const n3 = await axios.post(`${API}/notes`, {
    title: 'Distributed System Consensus: Raft vs Multi-Paxos',
    content: `# Distributed Consensus Comparison

Raft offers understandable leader-driven consensus with strong invariants:
- **Election Safety**: At most one leader per term.
- **Leader Append-Only**: Leaders never overwrite or truncate their own entries.
- **Log Matching Property**: If two logs contain an entry with the same index and term, they are identical up to that index.

\`\`\`python
# Heartbeat interval timeout check
import random, time

class RaftNode:
    def __init__(self, node_id):
        self.node_id = node_id
        self.term = 0
        self.state = "Follower"
        self.reset_election_timer()

    def reset_election_timer(self):
        self.election_timeout = random.uniform(0.15, 0.30)
\`\`\``,
    roadmapId: javaRoadmap?.id,
    tags: ['distributed-systems', 'raft', 'consensus'],
  });

  // 2. Seed Revisions
  await axios.post(`${API}/revisions`, {
    topic: 'PostgreSQL WAL Logging & Checkpoint Frequency',
    description: 'Understand Write-Ahead Logging buffer flushes, dirty page writing, and checkpoint tuning.',
    roadmapId: dbRoadmap?.id,
    noteId: n1.data.data.id,
    priority: 'high',
    intervalDays: 1,
  });

  await axios.post(`${API}/revisions`, {
    topic: 'Spring Security Filter Chain & Stateless Context',
    description: 'Review ThreadLocal cleanup and JWT bearer token extraction.',
    roadmapId: javaRoadmap?.id,
    noteId: n2.data.data.id,
    priority: 'normal',
    intervalDays: 3,
  });

  await axios.post(`${API}/revisions`, {
    topic: 'Raft Log Replication Invariants & Commit Index',
    description: 'Recall how commitIndex advances when replicated to majority of quorum.',
    roadmapId: javaRoadmap?.id,
    noteId: n3.data.data.id,
    priority: 'urgent',
    intervalDays: 7,
  });

  // 3. Seed Projects
  const p1 = await axios.post(`${API}/projects`, {
    name: 'Distributed High-Throughput KV Store with Raft Consensus',
    description: 'Production-ready distributed key-value storage engine featuring quorum consensus, log snapshotting, and gRPC RPC layer.',
    problemStatement: 'Provide linearizable reads and atomic writes across a 5-node cluster with resilience to arbitrary network partitions.',
    goals: 'Sub-30ms p99 write latency, automatic leader failover in under 400ms, zero data loss.',
    techStack: 'Go, gRPC, BadgerDB, Docker, Prometheus',
    githubUrl: 'https://github.com/engineering/raft-kv-store',
    demoUrl: 'https://raft-kv-demo.internal',
    documentationUrl: 'https://raft.github.io/spec.html',
    roadmapId: javaRoadmap?.id,
    status: 'active',
    priority: 'urgent',
  });

  // Add milestones & tasks to p1
  await axios.post(`${API}/projects/${p1.data.data.id}/milestones`, {
    title: 'M1: Cluster Membership & Leader Election',
    status: 'completed',
  });
  await axios.post(`${API}/projects/${p1.data.data.id}/milestones`, {
    title: 'M2: Quorum Log Replication & State Machine Apply',
    status: 'in_progress',
  });
  await axios.post(`${API}/projects/${p1.data.data.id}/milestones`, {
    title: 'M3: Snapshotting, Compaction & Benchmarking',
    status: 'pending',
  });

  await axios.post(`${API}/projects/${p1.data.data.id}/tasks`, {
    title: 'Implement randomized election timeout timer',
    status: 'completed',
    priority: 'urgent',
  });
  await axios.post(`${API}/projects/${p1.data.data.id}/tasks`, {
    title: 'Handle RequestVote RPC and candidate term increments',
    status: 'completed',
    priority: 'high',
  });
  await axios.post(`${API}/projects/${p1.data.data.id}/tasks`, {
    title: 'Implement AppendEntries log consistency validation',
    status: 'in_progress',
    priority: 'urgent',
  });

  const p2 = await axios.post(`${API}/projects`, {
    name: 'PostgreSQL Index Benchmarking & Buffer Cache Profiler',
    description: 'CLI tool to benchmark B-Tree, BRIN, and Hash indexes on 10M+ row tables and analyze buffer hit ratios.',
    problemStatement: 'Quantify sequential read overhead and index degradation under heavy random write workloads.',
    goals: 'Automated EXPLAIN ANALYZE comparison reporting and index size profiling.',
    techStack: 'Node.js, PostgreSQL 17, pg-promise, Docker Compose',
    githubUrl: 'https://github.com/engineering/pg-cache-profiler',
    roadmapId: dbRoadmap?.id,
    status: 'active',
    priority: 'high',
  });

  await axios.post(`${API}/projects/${p2.data.data.id}/milestones`, {
    title: 'M1: Benchmark Dataset Generator (10M Records)',
    status: 'completed',
  });
  await axios.post(`${API}/projects/${p2.data.data.id}/milestones`, {
    title: 'M2: Execution Plan JSON Parser & Visualizer',
    status: 'completed',
  });
  await axios.post(`${API}/projects/${p2.data.data.id}/tasks`, {
    title: 'Profile cache miss latency vs disk I/O',
    status: 'completed',
  });

  console.log('Seeding finished successfully!');
}

seedData().catch((err) => {
  console.error('Seeding failed:', err.response?.data || err.message);
});
