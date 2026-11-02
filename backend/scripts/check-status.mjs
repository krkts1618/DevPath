import { prisma } from '../src/config/db.js';

async function main() {
  const roadmap = await prisma.roadmap.findUnique({
    where: { id: 'e28b3ab1-0c44-46d8-a9fe-833574cc9f17' },
    include: {
      modules: {
        orderBy: { displayOrder: 'asc' },
        include: {
          roadmapDays: {
            orderBy: { dayNumber: 'asc' },
            include: {
              tasks: {
                orderBy: { displayOrder: 'asc' },
              },
            },
          },
        },
      },
    },
  });

  if (!roadmap) {
    console.log('Roadmap not found');
    return;
  }

  console.log('Roadmap:', roadmap.title);
  console.log('Modules Count:', roadmap.modules.length);
  const totalDays = roadmap.modules.reduce((sum, m) => sum + m.roadmapDays.length, 0);
  const totalTasks = roadmap.modules.reduce(
    (sum, m) => sum + m.roadmapDays.reduce((dSum, d) => dSum + d.tasks.length, 0),
    0
  );
  console.log('Total Days in DB:', totalDays);
  console.log('Total Tasks in DB:', totalTasks);

  console.log('\n--- MODULE 1 ---');
  console.log('Module 1 Title:', roadmap.modules[0]?.title);
  console.log('Module 1 Description:', roadmap.modules[0]?.description);
  console.log('Day 1 Title:', roadmap.modules[0]?.roadmapDays[0]?.title);
  console.log('Day 1 Objective:', roadmap.modules[0]?.roadmapDays[0]?.objective);
  console.log('Day 1 Tasks:');
  roadmap.modules[0]?.roadmapDays[0]?.tasks.forEach((t) => {
    console.log(`  - [${t.taskType}] ${t.title} (${t.estimatedDuration}m)`);
  });

  console.log('\n--- MODULE 15 ---');
  const lastMod = roadmap.modules[roadmap.modules.length - 1];
  console.log('Last Module Title:', lastMod?.title);
  const lastDay = lastMod?.roadmapDays[lastMod.roadmapDays.length - 1];
  console.log('Day 126 Title:', lastDay?.title);
  console.log('Day 126 Objective:', lastDay?.objective);
  console.log('Day 126 Tasks:');
  lastDay?.tasks.forEach((t) => {
    console.log(`  - [${t.taskType}] ${t.title} (${t.estimatedDuration}m)`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
