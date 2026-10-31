import { prisma } from '../src/config/db.js';

async function check() {
  const rms = await prisma.roadmap.findMany({
    select: { id: true, title: true, startDate: true, status: true },
  });
  console.log(JSON.stringify(rms, null, 2));
  process.exit(0);
}

check();
