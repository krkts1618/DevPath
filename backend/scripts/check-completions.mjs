import { prisma } from '../src/config/db.js';

async function main() {
  const comps = await prisma.taskCompletion.count({
    where: { task: { roadmapDay: { roadmapId: 'e28b3ab1-0c44-46d8-a9fe-833574cc9f17' } } }
  });
  console.log('Completions on this roadmap:', comps);
  const notes = await prisma.note.count({
    where: { roadmapId: 'e28b3ab1-0c44-46d8-a9fe-833574cc9f17' }
  });
  console.log('Notes on this roadmap:', notes);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
