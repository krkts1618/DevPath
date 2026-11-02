import { prisma } from '../src/config/db.js';

async function main() {
  const task = await prisma.task.findUnique({
    where: { id: '3277d2cb-d881-4f7a-a82d-16ac92364ed3' },
    include: { completions: true, roadmapDay: true },
  });
  console.log('Task:', task?.title);
  console.log('Day:', task?.roadmapDay?.dayNumber);
  console.log('Completions:', task?.completions);
}

main().catch(console.error).finally(() => prisma.$disconnect());
