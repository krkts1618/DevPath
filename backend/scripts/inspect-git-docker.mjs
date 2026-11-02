import { prisma } from '../src/config/db.js';

async function main() {
  const roadmap = await prisma.roadmap.findUnique({
    where: { id: 'd3b70a6a-4660-44d3-b419-e3f8457b8a5f' },
    include: {
      modules: {
        orderBy: { displayOrder: 'asc' },
        include: {
          roadmapDays: {
            orderBy: { dayNumber: 'asc' },
            include: { tasks: true },
          },
        },
      },
    },
  });

  if (!roadmap) {
    console.log('Roadmap not found');
    return;
  }

  console.log('Roadmap:', roadmap.title, 'Modules:', roadmap.modules.length);
  const completions = await prisma.taskCompletion.count({
    where: {
      task: {
        roadmapDay: {
          roadmapId: roadmap.id,
        },
      },
    },
  });
  console.log('Completions on Git+GitHub+Docker:', completions);

  for (const m of roadmap.modules) {
    console.log(`Module: "${m.title}" (Days ${m.startingDay}-${m.endingDay}, days count: ${m.roadmapDays.length})`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
