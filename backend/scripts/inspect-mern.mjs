import { prisma } from '../src/config/db.js';

async function main() {
  const roadmaps = await prisma.roadmap.findMany({
    include: {
      category: true,
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

  console.log(`Found ${roadmaps.length} roadmaps:`);
  for (const r of roadmaps) {
    const totalDays = r.modules.reduce((acc, m) => acc + m.roadmapDays.length, 0);
    const totalTasks = r.modules.reduce((acc, m) => acc + m.roadmapDays.reduce((tAcc, d) => tAcc + d.tasks.length, 0), 0);
    console.log(`- [${r.id}] "${r.title}" (slug: ${r.slug}, duration: ${r.duration}d, modules: ${r.modules.length}, days: ${totalDays}, tasks: ${totalTasks}, category: "${r.category?.name}")`);
  }

  const mern = roadmaps.find((r) => r.slug.includes('mern') || r.title.toLowerCase().includes('mern'));
  if (mern) {
    console.log('\n--- MERN ROADMAP DETAILS ---');
    console.log('ID:', mern.id);
    console.log('Title:', mern.title);
    console.log('Slug:', mern.slug);
    console.log('Duration:', mern.duration);
    console.log('Modules count:', mern.modules.length);
    for (const m of mern.modules) {
      console.log(`  Module: ${m.title} (Days ${m.startingDay}-${m.endingDay}, count: ${m.roadmapDays.length})`);
      if (m.roadmapDays.length > 0) {
        console.log(`    First Day: Day ${m.roadmapDays[0].dayNumber} - ${m.roadmapDays[0].title}`);
      }
    }

    // Check if there are any completions or notes on this roadmap
    const completions = await prisma.taskCompletion.count({
      where: {
        task: {
          roadmapDay: {
            roadmapId: mern.id,
          },
        },
      },
    });
    console.log(`Completions count on MERN roadmap: ${completions}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
