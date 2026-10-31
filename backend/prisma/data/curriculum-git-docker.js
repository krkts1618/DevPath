// Git + GitHub + Docker Curriculum (28 Days, 4 Modules)

const gitDockerModules = [
  {
    title: 'Module 1: Git Internals, Branching & Conflict Resolution',
    description: 'Working directory, staging index, commit graph, branching strategies, 3-way merges, and conflict resolution.',
    startingDay: 1,
    endingDay: 7,
    displayOrder: 1,
  },
  {
    title: 'Module 2: GitHub Collaboration, PRs, CI & Releases',
    description: 'Remote remotes, fork/pull-request workflows, branch protection rules, tags, releases, and GitHub Actions CI.',
    startingDay: 8,
    endingDay: 14,
    displayOrder: 2,
  },
  {
    title: 'Module 3: Docker Architecture, Containers & Dockerfiles',
    description: 'Docker daemon, image layering, Dockerfile instructions, port mapping, environment variables, and volumes.',
    startingDay: 15,
    endingDay: 21,
    displayOrder: 3,
  },
  {
    title: 'Module 4: Docker Compose Orchestration & Multi-Stage Deployment',
    description: 'Compose files, multi-service networking, persistent volumes, health checks, multi-stage builds, and MERN deployment.',
    startingDay: 22,
    endingDay: 28,
    displayOrder: 4,
  },
];

const dayData = [];

for (let d = 1; d <= 28; d++) {
  const modIdx = Math.floor((d - 1) / 7);
  const titles = [
    'Git Internals, Branching & Conflict Resolution',
    'GitHub Collaboration, PRs, CI & Releases',
    'Docker Architecture, Containers & Dockerfiles',
    'Docker Compose Orchestration & Multi-Stage Deployment',
  ];
  const modTitle = titles[modIdx];

  dayData.push({
    dayNumber: d,
    moduleIndex: modIdx,
    title: `Day ${d}: ${modTitle} - Part ${(d - 1) % 7 + 1}`,
    objective: `Master practical command-line developer workflows, container configs, and exercises for Day ${d}.`,
    tasks: [
      {
        title: `Study developer tooling concepts and command specifications for Day ${d}`,
        desc: `Learn architecture, internal object models, or configuration schemas for Day ${d} in ${modTitle}.`,
        type: 'learn',
        dur: 15,
      },
      {
        title: `Execute hands-on terminal commands and practical implementation for Day ${d}`,
        desc: `Run Git branching simulations, write Dockerfiles, or execute Docker Compose orchestration scripts.`,
        type: d % 7 === 0 ? 'project' : 'code',
        dur: 20,
      },
      {
        title: `Verify repository state or inspect running containers for Day ${d}`,
        desc: `Inspect commit trees via git log --graph or inspect running containers via docker ps and docker inspect.`,
        type: 'practice',
        dur: 10,
      },
    ],
  });
}

export const gitDockerCurriculum = {
  roadmapSlug: 'git-github-docker',
  modules: gitDockerModules,
  days: dayData.map((d) => ({
    dayNumber: d.dayNumber,
    moduleIndex: d.moduleIndex,
    title: d.title,
    objective: d.objective,
    estimatedStudyTime: 45,
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
