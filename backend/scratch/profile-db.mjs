import { prisma } from '../src/config/db.js';
import { StreakService } from '../src/services/streak.service.js';

async function profile() {
  console.log('--- PROFILING INDIVIDUAL DB QUERIES ---');

  // Query 1: Big Roadmap FindMany
  let t0 = performance.now();
  const roadmaps = await prisma.roadmap.findMany({
    where: { status: 'active' },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      roadmapDays: {
        orderBy: { dayNumber: 'asc' },
        include: {
          tasks: {
            include: { completions: true },
            orderBy: { displayOrder: 'asc' },
          },
        },
      },
    },
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
  });
  let d1 = performance.now() - t0;
  console.log(`1. Active Roadmaps with full tree (${roadmaps.length} roadmaps): ${d1.toFixed(1)}ms`);

  // Query 2: Streak calculation
  t0 = performance.now();
  await StreakService.calculateOverallStreak();
  let d2 = performance.now() - t0;
  console.log(`2. Streak calculation: ${d2.toFixed(1)}ms`);

  // Query 3: Roadmaps listing query (from roadmap.repository.js)
  t0 = performance.now();
  const listing = await prisma.roadmap.findMany({
    where: { status: 'active' },
    include: {
      category: true,
      roadmapDays: {
        include: {
          tasks: {
            include: { completions: true },
          },
        },
      },
    },
    take: 100,
  });
  let d3 = performance.now() - t0;
  console.log(`3. Roadmap listing query: ${d3.toFixed(1)}ms`);

  // Query 4: Reminders upcoming query
  t0 = performance.now();
  await prisma.revisionSchedule.findMany({
    include: {
      roadmap: { select: { id: true, title: true, categoryId: true, category: { select: { id: true, name: true } } } },
      roadmapDay: { select: { id: true, dayNumber: true, title: true } },
      task: { select: { id: true, title: true, taskType: true } },
      note: { select: { id: true, title: true } },
      sessions: { orderBy: { revisedAt: 'desc' }, take: 5 },
    },
  });
  let d4 = performance.now() - t0;
  console.log(`4. Revisions query for upcoming: ${d4.toFixed(1)}ms`);

  process.exit(0);
}

profile().catch(console.error);
