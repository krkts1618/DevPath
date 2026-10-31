import { prisma } from '../src/config/db.js';

async function testRaw() {
  for (let i = 1; i <= 3; i++) {
    const t0 = performance.now();
    const [taskCounts, completedCounts] = await Promise.all([
      prisma.$queryRaw`
        SELECT rd.roadmap_id, COUNT(t.id)::int as total_tasks
        FROM roadmap_days rd
        JOIN tasks t ON t.roadmap_day_id = rd.id
        GROUP BY rd.roadmap_id
      `,
      prisma.$queryRaw`
        SELECT rd.roadmap_id, COUNT(DISTINCT tc.task_id)::int as completed_tasks
        FROM roadmap_days rd
        JOIN tasks t ON t.roadmap_day_id = rd.id
        JOIN task_completions tc ON tc.task_id = t.id AND tc.completed = true
        GROUP BY rd.roadmap_id
      `,
    ]);
    const dur = performance.now() - t0;
    console.log(`Run ${i}: Aggregated task counts: ${dur.toFixed(1)}ms`);
  }
  process.exit(0);
}

testRaw().catch(console.error);
