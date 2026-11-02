import { prisma } from '../src/config/db.js';

async function main() {
  const roadmap = await prisma.roadmap.findUnique({
    where: { id: 'e28b3ab1-0c44-46d8-a9fe-833574cc9f17' },
    include: {
      category: true,
      modules: { orderBy: { startingDay: 'asc' } },
      roadmapDays: {
        where: { dayNumber: { in: [1, 2, 3] } },
        orderBy: { dayNumber: 'asc' },
        include: { tasks: true }
      }
    }
  });

  console.log('ID:', roadmap?.id);
  console.log('Title:', roadmap?.title);
  console.log('Category:', roadmap?.category?.name);
  console.log('Modules count:', roadmap?.modules?.length);
  roadmap?.modules?.forEach(m => {
    console.log(`- ${m.title} (Days ${m.startingDay}-${m.endingDay}) [ID: ${m.id}]`);
  });
  console.log('Sample Day 1:', JSON.stringify(roadmap?.roadmapDays[0], null, 2));
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
