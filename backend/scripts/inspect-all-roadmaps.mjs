import { prisma } from '../src/config/db.js';

async function main() {
  const roadmaps = await prisma.roadmap.findMany({
    include: {
      category: true,
      _count: {
        select: {
          modules: true,
          roadmapDays: true,
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  console.log(`Found ${roadmaps.length} roadmaps:`);
  for (const r of roadmaps) {
    console.log(`- ID: ${r.id} | Slug: ${r.slug} | Title: "${r.title}" | Category: "${r.category?.name}" (${r.categoryId}) | Status: ${r.status} | Modules: ${r._count.modules} | Days: ${r._count.roadmapDays}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
