// Git + GitHub + Docker Curriculum (28 Days, 4 Modules)
// Exact syllabus provided with daily tasks, concepts, and actionable checklists.

export const gitDockerModules = [
  {
    week: 1,
    title: 'Week 1 — Git fundamentals beyond the basics',
    goal: 'Goal: Master command-line Git operations, commit history inspection, branching, and conflict resolution.',
    concepts: 'commits, git status, git log, git diff, .gitignore, branching, interactive rebase, merge conflicts, stash, cherry-pick, reset, revert, PR lifecycle.',
    startingDay: 1,
    endingDay: 7,
    displayOrder: 1,
  },
  {
    week: 2,
    title: 'Week 2 — GitHub collaboration',
    goal: 'Goal: Practice professional team collaboration on GitHub with issue tracking, PR reviews, protected branches, and CI automation.',
    concepts: 'GitHub issues, branch linking, PR reviews, inline comments, conflict resolution, branch protection rules, SemVer tags, releases, GitHub Actions CI.',
    startingDay: 8,
    endingDay: 14,
    displayOrder: 2,
  },
  {
    week: 3,
    title: 'Week 3 — Docker fundamentals',
    goal: 'Goal: Master containerization essentials, Dockerfiles, container lifecycles, environment variables, named volumes, and custom networks.',
    concepts: 'Docker daemon, images, containers, registries, Dockerfiles, layer caching, port mapping, .dockerignore, named volumes, data persistence, Docker networks.',
    startingDay: 15,
    endingDay: 21,
    displayOrder: 3,
  },
  {
    week: 4,
    title: 'Week 4 — Docker Compose and real projects',
    goal: 'Goal: Orchestrate multi-service full-stack applications with Docker Compose, health checks, multi-stage builds, and production readiness.',
    concepts: 'docker-compose.yml, multi-service orchestration, service discovery, volumes, health checks, depends_on, multi-stage builds, clean-slate testing, documentation.',
    startingDay: 22,
    endingDay: 28,
    displayOrder: 4,
  },
];

export const gitDockerDayRows = [
  // --- WEEK 1: Git fundamentals beyond the basics (Days 1-7) ---
  {
    day: 1,
    week: 1,
    topic: 'Git Status, Commits, Log, Diff & .gitignore',
    task: 'Inspect commits, git status, git log, diff, and .gitignore',
    concepts: 'git status, git log, diff, .gitignore, working tree, staging area, commit graph.',
    checklist: [
      { title: 'Inspect commits, git status, git log, diff, and .gitignore', type: 'code', dur: 30, desc: 'Practice inspecting changes across working directory, staging area, and repository history.' },
      { title: 'Practice git diff, git diff --staged, and format custom log graphs', type: 'practice', dur: 20, desc: 'Run git log --oneline --graph --all and configure convenient global log formatting aliases.' },
      { title: 'Construct a robust .gitignore file for Node/React and test untracked ignores', type: 'learn', dur: 10, desc: 'Ensure node_modules, .env, and build artifacts are strictly ignored and not tracked.' },
    ],
  },
  {
    day: 2,
    week: 1,
    topic: 'Feature Branching & Merging',
    task: 'Create feature branches; merge them into main',
    concepts: 'Feature branching, git switch, git branch, fast-forward merge, 3-way merge, --no-ff.',
    checklist: [
      { title: 'Create feature branches; merge them into main', type: 'code', dur: 30, desc: 'Practice creating feature branches with git switch -c and making isolated feature commits.' },
      { title: 'Execute fast-forward and 3-way merge commits (--no-ff)', type: 'practice', dur: 20, desc: 'Observe how Git creates merge commits, resolves HEAD pointers, and records history.' },
      { title: 'Inspect branch graphs and clean up merged local branches', type: 'learn', dur: 10, desc: 'Use git branch --merged and git branch -d to delete obsolete branches cleanly.' },
    ],
  },
  {
    day: 3,
    week: 1,
    topic: 'Interactive Rebase & History Hygiene',
    task: 'Practice interactive rebase and understand when to avoid rewriting shared history',
    concepts: 'Interactive rebase, git rebase -i, squash, fixup, reword, Golden Rule of Rebasing.',
    checklist: [
      { title: 'Practice interactive rebase and understand when to avoid rewriting shared history', type: 'code', dur: 30, desc: 'Use git rebase -i HEAD~n to clean up messy WIP commits into coherent logical units.' },
      { title: 'Practice squash, fixup, drop, and edit commands in an interactive rebase', type: 'practice', dur: 20, desc: 'Combine commits, rewrite commit messages, and reorder changes cleanly.' },
      { title: 'Understand the Golden Rule of Rebasing: never rewrite pushed shared history', type: 'learn', dur: 10, desc: 'Learn why force-pushing rewritten history to shared team branches causes upstream conflicts.' },
    ],
  },
  {
    day: 4,
    week: 1,
    topic: 'Creating & Resolving Merge Conflicts',
    task: 'Create and resolve a real merge conflict',
    concepts: 'Merge conflicts, conflict markers, manual resolution, git status, git add, merge completion.',
    checklist: [
      { title: 'Create and resolve a real merge conflict', type: 'code', dur: 30, desc: 'Intentionally modify the same lines across two branches to trigger a real merge conflict.' },
      { title: 'Inspect conflict markers (<<<<<<<, =======, >>>>>>>) and resolve manually', type: 'practice', dur: 20, desc: 'Evaluate changes, retain the correct code, remove conflict markers, and stage the files.' },
      { title: 'Complete merge or rebase with git commit or git rebase --continue', type: 'learn', dur: 10, desc: 'Verify clean repository state with git status and test code execution integrity.' },
    ],
  },
  {
    day: 5,
    week: 1,
    topic: 'Stash, Cherry-Pick, Reset & Revert',
    task: 'Practice stash, cherry-pick, reset, and revert',
    concepts: 'git stash, cherry-pick, git reset (--soft, --mixed, --hard), git revert, safe undos.',
    checklist: [
      { title: 'Practice stash, cherry-pick, reset, and revert', type: 'code', dur: 30, desc: 'Master Git undo mechanisms and selective commit application across branches.' },
      { title: 'Execute git stash save/pop and selectively apply commits using git cherry-pick', type: 'practice', dur: 20, desc: 'Save uncommitted work temporarily and port specific commit fixes across branches.' },
      { title: 'Compare git reset (--soft, --mixed, --hard) vs git revert for public safety', type: 'learn', dur: 10, desc: 'Understand non-destructive commit reversals on public branches using git revert.' },
    ],
  },
  {
    day: 6,
    week: 1,
    topic: 'Pull Request Lifecycle & Code Review',
    task: 'Open a PR, review changes, request changes, and merge it',
    concepts: 'Pull requests, code reviews, inline comments, requested changes, PR merge options.',
    checklist: [
      { title: 'Open a PR, review changes, request changes, and merge it', type: 'code', dur: 30, desc: 'Push feature branch to remote GitHub repository and initiate a structured Pull Request.' },
      { title: 'Conduct code review: leave inline comments, suggestions, and request changes', type: 'practice', dur: 20, desc: 'Practice leaving actionable review feedback and submitting review verdicts.' },
      { title: 'Push fixes addressing review feedback, approve PR, and merge with squash or merge commit', type: 'learn', dur: 10, desc: 'Observe how GitHub automatically updates PRs upon pushing follow-up commits.' },
    ],
  },
  {
    day: 7,
    week: 1,
    topic: 'Full Feature-Branch Workflow & Git Notes',
    task: 'Reproduce a complete feature-branch workflow and write notes',
    concepts: 'End-to-end Git workflow, clean history, commit hygiene, engineering notes.',
    checklist: [
      { title: 'Reproduce a complete feature-branch workflow and write notes', type: 'practice', dur: 30, desc: 'Execute end-to-end: create branch -> implement -> rebase/cleanup -> PR -> review -> merge.' },
      { title: 'Verify clean Git log graph and delete remote feature branch upon merge', type: 'code', dur: 20, desc: 'Check git log --graph --oneline, pull latest main locally, and prune stale branches.' },
      { title: 'Write comprehensive engineering notes summarizing Week 1 Git commands and mental models', type: 'revise', dur: 10, desc: 'Document branching strategies, conflict resolution, and safe rebase rules.' },
    ],
  },

  // --- WEEK 2: GitHub collaboration (Days 8-14) ---
  {
    day: 8,
    week: 2,
    topic: 'GitHub Issues & Branch Linking',
    task: 'Create issues and link branches and PRs to them',
    concepts: 'GitHub issues, issue linking, auto-closing keywords (Closes #X, Fixes #X), project boards.',
    checklist: [
      { title: 'Create issues and link branches and PRs to them', type: 'code', dur: 30, desc: 'Create structured GitHub issues with clear descriptions, acceptance criteria, and labels.' },
      { title: 'Link branches and commits to issues using keywords (Closes #X, Fixes #X)', type: 'practice', dur: 20, desc: 'Verify GitHub issue shows linked branch and automatically closes upon PR merge.' },
      { title: 'Configure GitHub project board or milestone to track issue progression', type: 'learn', dur: 10, desc: 'Organize sprint issues across Todo, In Progress, and Done workflow columns.' },
    ],
  },
  {
    day: 9,
    week: 2,
    topic: 'PR Reviews, Comments & Iteration',
    task: 'Review a PR, leave comments, and push requested changes',
    concepts: 'PR reviews, GitHub suggestion blocks, multi-line diffs, review iterations.',
    checklist: [
      { title: 'Review a PR, leave comments, and push requested changes', type: 'code', dur: 30, desc: 'Review pull request diffs line-by-line using GitHub web interface.' },
      { title: 'Use GitHub suggestion blocks and multi-line comments for constructive feedback', type: 'practice', dur: 20, desc: 'Test applying suggestions directly and pushing follow-up commits to the branch.' },
      { title: 'Verify PR status checks, re-request review, and confirm approval before merging', type: 'learn', dur: 10, desc: 'Ensure green review status and resolve all discussion conversations cleanly.' },
    ],
  },
  {
    day: 10,
    week: 2,
    topic: 'Conflict Resolution during Pull Requests',
    task: 'Practice resolving conflicts during a PR',
    concepts: 'Upstream branch sync, PR conflicts, local conflict resolution, git fetch, git rebase/merge origin/main.',
    checklist: [
      { title: 'Practice resolving conflicts during a PR', type: 'code', dur: 30, desc: 'Simulate upstream changes on main that conflict with an open PR feature branch.' },
      { title: 'Resolve PR conflicts locally using git checkout feature && git merge origin/main or rebase', type: 'practice', dur: 20, desc: 'Fix conflicts locally, test build and test suites, and push updated branch to GitHub.' },
      { title: 'Explore GitHub Web Conflict Editor and understand when local resolution is preferred', type: 'learn', dur: 10, desc: 'Understand why complex multi-file conflicts require local compilation and testing.' },
    ],
  },
  {
    day: 11,
    week: 2,
    topic: 'Branch Protection Rules & Governance',
    task: 'Add branch rules and learn protected-branch workflows',
    concepts: 'Branch protection rules, required approvals, required CI checks, disallow force push, CODEOWNERS.',
    checklist: [
      { title: 'Add branch rules and learn protected-branch workflows', type: 'code', dur: 30, desc: 'Configure GitHub branch protection rules on main branch in repository settings.' },
      { title: 'Enforce PR requirements: require approvals, require status checks to pass, disallow force push', type: 'practice', dur: 20, desc: 'Verify direct push to main is blocked by remote hook and requires PR approval.' },
      { title: 'Understand linear history, code owner reviews (CODEOWNERS), and administrator bypass rules', type: 'learn', dur: 10, desc: 'Document team governance policies for production codebase stability.' },
    ],
  },
  {
    day: 12,
    week: 2,
    topic: 'Git Version Tags & GitHub Releases',
    task: 'Create version tags and a GitHub Release',
    concepts: 'Semantic Versioning (SemVer), annotated git tags, git push --tags, GitHub Releases, changelogs.',
    checklist: [
      { title: 'Create version tags and a GitHub Release', type: 'code', dur: 30, desc: 'Learn Semantic Versioning (MAJOR.MINOR.PATCH) and tag creation mechanics.' },
      { title: 'Create annotated tags with git tag -a v1.0.0 -m "Release v1.0.0" and push with git push --tags', type: 'practice', dur: 20, desc: 'Inspect tag metadata with git show v1.0.0 and verify tags appear on GitHub.' },
      { title: 'Publish a GitHub Release with release notes, changelog summary, and binary/source assets', type: 'learn', dur: 10, desc: 'Use GitHub Release UI to generate automated changelog and attach distribution assets.' },
    ],
  },
  {
    day: 13,
    week: 2,
    topic: 'GitHub Actions CI Workflows',
    task: 'Create a basic GitHub Actions workflow for linting or tests',
    concepts: 'GitHub Actions, CI workflow, .github/workflows, actions/checkout, actions/setup-node, status checks.',
    checklist: [
      { title: 'Create a basic GitHub Actions workflow for linting or tests', type: 'code', dur: 30, desc: 'Create .github/workflows/ci.yml triggering on pull requests targeting main.' },
      { title: 'Define job steps: checkout code (actions/checkout), setup-node, npm ci, and npm test', type: 'practice', dur: 20, desc: 'Configure dependency caching to accelerate CI pipeline run duration.' },
      { title: 'Trigger workflow via PR, inspect live runner logs, and verify required status check integration', type: 'learn', dur: 10, desc: 'Confirm failing tests block PR merge when protected branch requires green checks.' },
    ],
  },
  {
    day: 14,
    week: 2,
    topic: 'Simulated Team Contribution',
    task: 'Complete a simulated team contribution from issue to merged PR',
    concepts: 'Team contribution simulation, issue to merge, green CI, release management.',
    checklist: [
      { title: 'Complete a simulated team contribution from issue to merged PR', type: 'project', dur: 30, desc: 'Execute real production ticket lifecycle: claim issue, branch, build feature, write tests.' },
      { title: 'Submit PR with linked issue, pass CI pipeline, request review, and merge via squash', type: 'practice', dur: 20, desc: 'Verify issue closes automatically and changelog reflects contribution.' },
      { title: 'Document GitHub collaboration takeaways and clean up obsolete remote branches', type: 'revise', dur: 10, desc: 'Summarize team workflows, branch rules, and CI best practices.' },
    ],
  },

  // --- WEEK 3: Docker fundamentals (Days 15-21) ---
  {
    day: 15,
    week: 3,
    topic: 'Docker Concepts, Daemon & Architecture',
    task: 'Install/check Docker; understand images, containers, and registries',
    concepts: 'Docker daemon, client-server architecture, images, containers, registries, Docker Hub.',
    checklist: [
      { title: 'Install/check Docker; understand images, containers, and registries', type: 'code', dur: 30, desc: 'Verify Docker installation and daemon status using docker version and docker info.' },
      { title: 'Pull and run hello-world and alpine containers from Docker Hub', type: 'practice', dur: 20, desc: 'Run docker run -it alpine sh and explore the isolated container filesystem.' },
      { title: 'Analyze Docker client-server architecture, image layers, and container isolation principles', type: 'learn', dur: 10, desc: 'Understand Linux namespaces, cgroups, and registry repositories.' },
    ],
  },
  {
    day: 16,
    week: 3,
    topic: 'Writing Node.js Dockerfiles',
    task: 'Write a Dockerfile for a simple Node.js application',
    concepts: 'Dockerfile, FROM, WORKDIR, COPY, RUN, EXPOSE, CMD, layer caching.',
    checklist: [
      { title: 'Write a Dockerfile for a simple Node.js application', type: 'code', dur: 30, desc: 'Create Dockerfile using node:alpine base image with WORKDIR /app.' },
      { title: 'Implement layer caching: COPY package*.json, RUN npm install, then COPY source code', type: 'practice', dur: 20, desc: 'Structure instructions to prevent redundant node_modules reinstallations on code changes.' },
      { title: 'Specify EXPOSE port and CMD ["node", "server.js"] runtime execution array', type: 'learn', dur: 10, desc: 'Differentiate CMD vs ENTRYPOINT and verify clean exec array format.' },
    ],
  },
  {
    day: 17,
    week: 3,
    topic: 'Container Lifecycle Management & Port Mapping',
    task: 'Build, run, inspect, stop, and remove containers; map ports',
    concepts: 'docker build, docker run, port mapping (-p), docker ps, docker logs, docker exec, docker stop/rm.',
    checklist: [
      { title: 'Build, run, inspect, stop, and remove containers; map ports', type: 'code', dur: 30, desc: 'Build image with docker build -t node-app:1.0 . and run with docker run -d -p 3000:3000.' },
      { title: 'Inspect active containers: docker ps, docker logs, docker exec -it, and docker inspect', type: 'practice', dur: 20, desc: 'Debug running container, inspect environment variables, and inspect IP address.' },
      { title: 'Manage lifecycle cleanly: docker stop, docker start, docker rm, and docker rmi', type: 'learn', dur: 10, desc: 'Clean up stopped containers and dangling images with docker system prune.' },
    ],
  },
  {
    day: 18,
    week: 3,
    topic: 'Environment Variables & .dockerignore',
    task: 'Configure environment variables and .dockerignore',
    concepts: 'Environment variables (-e, --env-file), .dockerignore, build context size, security.',
    checklist: [
      { title: 'Configure environment variables and .dockerignore', type: 'code', dur: 30, desc: 'Create .dockerignore file excluding node_modules, .git, .env, and test logs.' },
      { title: 'Pass environment variables at runtime with docker run -e PORT=8080 or --env-file', type: 'practice', dur: 20, desc: 'Verify application reads container environment variables correctly.' },
      { title: 'Compare image build time and image size with and without .dockerignore', type: 'learn', dur: 10, desc: 'Understand build context transmission overhead and security risks of leaking .env.' },
    ],
  },
  {
    day: 19,
    week: 3,
    topic: 'Named Volumes & MongoDB Data Persistence',
    task: 'Run MongoDB with a named volume; restart it and verify persistence',
    concepts: 'Docker volumes, named volumes (-v), data persistence, MongoDB container, docker volume inspect.',
    checklist: [
      { title: 'Run MongoDB with a named volume; restart it and verify persistence', type: 'code', dur: 30, desc: 'Run MongoDB container with named volume: docker run -d -v mongo-data:/data/db mongo.' },
      { title: 'Insert sample documents using mongosh inside container and stop container', type: 'practice', dur: 20, desc: 'Remove container with docker rm -f and start a brand new container on the same volume.' },
      { title: 'Verify data persistence across container destruction and inspect volume with docker volume inspect', type: 'learn', dur: 10, desc: 'Differentiate anonymous volumes, named volumes, and bind mounts.' },
    ],
  },
  {
    day: 20,
    week: 3,
    topic: 'Custom Docker Networks & Inter-Container Communication',
    task: 'Create a custom Docker network and connect application containers',
    concepts: 'Docker networks, bridge network, container DNS resolution, docker network inspect.',
    checklist: [
      { title: 'Create a custom Docker network and connect application containers', type: 'code', dur: 30, desc: 'Create user-defined bridge network with docker network create app-net.' },
      { title: 'Connect MongoDB container and test container to app-net; communicate using container names', type: 'practice', dur: 20, desc: 'Verify built-in Docker DNS resolves container names to private IP addresses.' },
      { title: 'Inspect network topology with docker network inspect app-net and test ping resolution', type: 'learn', dur: 10, desc: 'Understand why default bridge lacks automatic DNS resolution while custom networks enable it.' },
    ],
  },
  {
    day: 21,
    week: 3,
    topic: 'Full API + MongoDB Containerization',
    task: 'Containerize your Express API and connect it to MongoDB',
    concepts: 'Express containerization, MongoDB connection strings, inter-container networking, API testing.',
    checklist: [
      { title: 'Containerize your Express API and connect it to MongoDB', type: 'code', dur: 30, desc: 'Connect Express API to containerized MongoDB on the custom network using mongodb://mongo:27017/db.' },
      { title: 'Verify API CRUD routes execute successfully and persist records in MongoDB volume', type: 'practice', dur: 20, desc: 'Test POST and GET requests from host machine via mapped API port.' },
      { title: 'Document Week 3 Docker CLI commands and container architecture in notes', type: 'revise', dur: 10, desc: 'Review images, containers, volumes, networks, and port binding concepts.' },
    ],
  },

  // --- WEEK 4: Docker Compose and real projects (Days 22-28) ---
  {
    day: 22,
    week: 4,
    topic: 'Docker Compose for API & Database',
    task: 'Write a Compose file for the API and database',
    concepts: 'docker-compose.yml, services, ports, environment, volumes, docker compose up/down.',
    checklist: [
      { title: 'Write a Compose file for the API and database', type: 'code', dur: 30, desc: 'Create docker-compose.yml declaring api and mongo services.' },
      { title: 'Configure build context, image tags, ports mapping, and environment variables', type: 'practice', dur: 20, desc: 'Spin up the stack with docker compose up -d and inspect with docker compose ps.' },
      { title: 'Inspect unified logs with docker compose logs -f and practice stopping with docker compose down', type: 'learn', dur: 10, desc: 'Understand multi-container orchestration benefits over manual CLI commands.' },
    ],
  },
  {
    day: 23,
    week: 4,
    topic: 'Compose Named Volumes & Service Networking',
    task: 'Add named volumes, environment variables, and service networking',
    concepts: 'Compose volumes, custom networks in compose, .env variable substitution, data persistence.',
    checklist: [
      { title: 'Add named volumes, environment variables, and service networking', type: 'code', dur: 30, desc: 'Configure top-level volumes: and networks: blocks in docker-compose.yml.' },
      { title: 'Pass environment variables using an external .env file and variable interpolation (${PORT})', type: 'practice', dur: 20, desc: 'Verify Compose automatically reads .env in the project root.' },
      { title: 'Verify persistent database storage survives docker compose down and docker compose up', type: 'learn', dur: 10, desc: 'Verify volumes are retained unless explicitly purged with docker compose down -v.' },
    ],
  },
  {
    day: 24,
    week: 4,
    topic: 'Health Checks & Service Dependency Ordering',
    task: 'Add health checks and understand startup dependencies',
    concepts: 'Healthcheck directives, depends_on, condition: service_healthy, readiness vs liveness.',
    checklist: [
      { title: 'Add health checks and understand startup dependencies', type: 'code', dur: 30, desc: 'Define healthcheck: for MongoDB service in docker-compose.yml.' },
      { title: 'Configure depends_on with condition: service_healthy to prevent API premature startup', type: 'practice', dur: 20, desc: 'Ensure backend API starts only after MongoDB responds as healthy.' },
      { title: 'Inspect container health status transitions using docker inspect and compose logs', type: 'learn', dur: 10, desc: 'Differentiate depends_on (container start) vs condition: service_healthy (readiness).' },
    ],
  },
  {
    day: 25,
    week: 4,
    topic: 'React Frontend Containerization & Full-Stack Integration',
    task: 'Containerize your React frontend and connect it to the backend',
    concepts: 'Frontend containerization, Nginx proxy, 3-tier architecture, full-stack docker compose.',
    checklist: [
      { title: 'Containerize your React frontend and connect it to the backend', type: 'code', dur: 30, desc: 'Add frontend service to docker-compose.yml with port 80/5173 mapped to host.' },
      { title: 'Configure Nginx reverse proxy or Vite dev server proxy to route /api requests to backend', type: 'practice', dur: 20, desc: 'Test complete browser interaction: frontend UI -> Express backend -> MongoDB.' },
      { title: 'Verify CORS and network connectivity across all 3 services on Compose bridge network', type: 'learn', dur: 10, desc: 'Confirm full end-to-end functionality from the host browser.' },
    ],
  },
  {
    day: 26,
    week: 4,
    topic: 'Multi-Stage Builds & Image Optimization',
    task: 'Use multi-stage builds where appropriate; reduce unnecessary image contents',
    concepts: 'Multi-stage Dockerfiles, image size reduction, security hardening, non-root user.',
    checklist: [
      { title: 'Use multi-stage builds where appropriate; reduce unnecessary image contents', type: 'code', dur: 30, desc: 'Implement 2-stage Dockerfile: build stage (node:20) + production server stage (nginx:alpine).' },
      { title: 'Compare resulting image sizes (e.g. 1GB+ full node down to ~25MB Nginx production image)', type: 'practice', dur: 20, desc: 'Run docker images and verify dramatic reduction in attack surface and size.' },
      { title: 'Enforce non-root user execution and verify security compliance of final container', type: 'learn', dur: 10, desc: 'Understand security benefits of stripping compiler tools and source files from runtime image.' },
    ],
  },
  {
    day: 27,
    week: 4,
    topic: 'Clean-Slate Orchestration & Disaster Recovery',
    task: 'Run a complete existing project from a clean setup using Compose',
    concepts: 'Clean-slate deployment, docker compose up --build, failure recovery, restart policies.',
    checklist: [
      { title: 'Run a complete existing project from a clean setup using Compose', type: 'code', dur: 30, desc: 'Clone project into fresh directory and execute docker compose up --build.' },
      { title: 'Verify complete application spins up and initializes database seed automatically', type: 'practice', dur: 20, desc: 'Test entire workflow: database ready -> backend up -> frontend serves.' },
      { title: 'Simulate container crashes and test automatic recovery with restart: unless-stopped', type: 'learn', dur: 10, desc: 'Confirm fault tolerance and document clean teardown with docker compose down.' },
    ],
  },
  {
    day: 28,
    week: 4,
    topic: 'Production Documentation, Demo & Final Retrospective',
    task: 'Write the README, verify persistence, troubleshoot failures, and record a demo',
    concepts: 'Technical documentation, README, architecture diagram, demo recording, troubleshooting.',
    checklist: [
      { title: 'Write the README, verify persistence, troubleshoot failures, and record a demo', type: 'project', dur: 30, desc: 'Author a polished README with architecture diagram, prerequisites, and Compose commands.' },
      { title: 'Document troubleshooting guide: common port conflicts, volume resets, and network debugs', type: 'practice', dur: 20, desc: 'Add troubleshooting FAQ for other developers cloning the repo.' },
      { title: 'Record or screenshot full working demo, review 28-day journey, and celebrate completion!', type: 'revise', dur: 10, desc: 'Complete final review of Git, GitHub, and Docker professional developer skills.' },
    ],
  },
];

export const gitDockerCurriculum = {
  roadmapSlug: 'git-github-docker',
  modules: gitDockerModules.map((m) => ({
    title: m.title,
    description: `${m.goal} ${m.concepts}`,
    startingDay: m.startingDay,
    endingDay: m.endingDay,
    displayOrder: m.displayOrder,
  })),
  days: gitDockerDayRows.map((d) => {
    const mod = gitDockerModules.find((m) => d.day >= m.startingDay && d.day <= m.endingDay);
    return {
      dayNumber: d.day,
      moduleIndex: mod ? mod.displayOrder - 1 : 0,
      title: `Day ${d.day}: ${d.topic}`,
      objective: d.concepts,
      estimatedStudyTime: 60,
      dayType: d.day % 7 === 0 ? 'project' : d.day % 6 === 0 ? 'practice' : 'learning',
      tasks: d.checklist.map((t, idx) => ({
        title: t.title,
        description: t.desc,
        taskType: t.type,
        estimatedDuration: t.dur,
        displayOrder: idx + 1,
      })),
    };
  }),
};
