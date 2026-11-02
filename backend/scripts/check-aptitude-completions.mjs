import { prisma } from '../src/config/db.js';

async function main() {
  const count = await prisma.taskCompletion.count({
    where: {
      task: {
        roadmapDay: {
          roadmapId: 'be1c41d8-c33b-43dc-b1b6-83ae8c39c7a1',
        },
      },
    },
  });
  console.log('Completions on Aptitude:', count);
}

main().catch(console.error).finally(() => prisma.$disconnect());
