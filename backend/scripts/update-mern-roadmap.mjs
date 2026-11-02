import { prisma } from '../src/config/db.js';
import { mernModules, mernDayRows } from '../prisma/data/curriculum-mern.js';

const TARGET_ROADMAP_ID = '93c3c695-36d2-4f58-a492-890b07e42937';
const TARGET_SLUG = 'mern-stack-maintenance';

async function updateMernCurriculum() {
  console.log('🚀 Starting MERN Stack Development Curriculum Update...');
  const startTime = Date.now();

  // 1. Locate Roadmap
  let roadmap = await prisma.roadmap.findUnique({
    where: { id: TARGET_ROADMAP_ID },
    include: {
      modules: { orderBy: { displayOrder: 'asc' } },
      roadmapDays: {
        orderBy: { dayNumber: 'asc' },
        include: { tasks: true },
      },
    },
  });

  if (!roadmap) {
    roadmap = await prisma.roadmap.findUnique({
      where: { slug: TARGET_SLUG },
      include: {
        modules: { orderBy: { displayOrder: 'asc' } },
        roadmapDays: {
          orderBy: { dayNumber: 'asc' },
          include: { tasks: true },
        },
      },
    });
  }

  if (!roadmap) {
    throw new Error(`Roadmap ${TARGET_ROADMAP_ID} or slug ${TARGET_SLUG} not found in database.`);
  }

  console.log(`Found Roadmap: "${roadmap.title}" (ID: ${roadmap.id})`);

  // 2. Update Roadmap metadata
  await prisma.roadmap.update({
    where: { id: roadmap.id },
    data: {
      title: 'MERN Stack Development',
      description:
        '56-day comprehensive MERN stack progression covering React revision, advanced React patterns, Node.js & Express architecture, MongoDB & Mongoose data modeling, authentication & security, full-stack mini-project integration, automated testing, and Docker cloud deployment.',
      duration: 56,
      targetDailyStudyTime: 80,
    },
  });
  console.log('✓ Roadmap metadata updated.');

  // 3. Upsert the 8 Modules (Weeks 1 to 8)
  const moduleMap = new Map(); // week index -> Module record
  const existingModules = roadmap.modules.sort((a, b) => a.startingDay - b.startingDay);

  for (let idx = 0; idx < mernModules.length; idx++) {
    const m = mernModules[idx];
    const existingMod = existingModules[idx];

    let modRecord;
    if (existingMod) {
      modRecord = await prisma.module.update({
        where: { id: existingMod.id },
        data: {
          title: m.title,
          description: `${m.goal} ${m.concepts}`,
          startingDay: m.startingDay,
          endingDay: m.endingDay,
          displayOrder: idx + 1,
        },
      });
    } else {
      modRecord = await prisma.module.create({
        data: {
          roadmapId: roadmap.id,
          title: m.title,
          description: `${m.goal} ${m.concepts}`,
          startingDay: m.startingDay,
          endingDay: m.endingDay,
          displayOrder: idx + 1,
        },
      });
    }
    moduleMap.set(idx, modRecord);
    console.log(`  ✓ Updated Module ${idx + 1}: "${m.title}" (Days ${m.startingDay}-${m.endingDay})`);
  }

  // 4. Upsert 56 Days and 168 Checklist Tasks
  const existingDaysMap = new Map();
  roadmap.roadmapDays.forEach((d) => existingDaysMap.set(d.dayNumber, d));

  console.log('Syncing 56 Days and 168 Checklist Tasks...');

  for (const row of mernDayRows) {
    const modIdx = mernModules.findIndex((m) => row.day >= m.startingDay && row.day <= m.endingDay);
    const mod = moduleMap.get(modIdx);

    const dayTitle = `Day ${row.day}: ${row.topic}`;
    const dayObjective = row.concepts;
    const dayType = row.day % 7 === 0 ? 'project' : row.day % 6 === 0 ? 'practice' : 'learning';

    let dayRecord = existingDaysMap.get(row.day);

    if (dayRecord) {
      dayRecord = await prisma.roadmapDay.update({
        where: { id: dayRecord.id },
        data: {
          moduleId: mod.id,
          title: dayTitle,
          objective: dayObjective,
          estimatedStudyTime: 80,
          dayType: dayType,
        },
      });
    } else {
      dayRecord = await prisma.roadmapDay.create({
        data: {
          roadmapId: roadmap.id,
          moduleId: mod.id,
          dayNumber: row.day,
          title: dayTitle,
          objective: dayObjective,
          estimatedStudyTime: 80,
          dayType: dayType,
        },
      });
    }

    // Replace tasks for this day with the actionable checklist
    await prisma.task.deleteMany({
      where: { roadmapDayId: dayRecord.id },
    });

    await prisma.task.createMany({
      data: row.checklist.map((t, idx) => ({
        roadmapDayId: dayRecord.id,
        title: t.title,
        description: t.desc,
        taskType: t.type,
        estimatedDuration: t.dur,
        displayOrder: idx + 1,
        isRequired: true,
      })),
    });

    if (row.day % 7 === 0) {
      console.log(`  ✓ Synced through Week ${row.day / 7} (Day ${row.day})`);
    }
  }

  // 5. Verification
  const verifyRoadmap = await prisma.roadmap.findUnique({
    where: { id: roadmap.id },
    include: {
      modules: {
        orderBy: { displayOrder: 'asc' },
        include: {
          roadmapDays: {
            orderBy: { dayNumber: 'asc' },
            include: { tasks: { orderBy: { displayOrder: 'asc' } } },
          },
        },
      },
    },
  });

  const totalDays = verifyRoadmap.modules.reduce((sum, m) => sum + m.roadmapDays.length, 0);
  const totalTasks = verifyRoadmap.modules.reduce(
    (sum, m) => sum + m.roadmapDays.reduce((dSum, d) => dSum + d.tasks.length, 0),
    0
  );

  console.log('\n======================================================');
  console.log('🎉 MERN CURRICULUM UPDATE COMPLETE & VERIFIED');
  console.log('======================================================');
  console.log(`Roadmap Title: ${verifyRoadmap.title}`);
  console.log(`Modules Count: ${verifyRoadmap.modules.length} (Expected: 8)`);
  console.log(`Days Count: ${totalDays} (Expected: 56)`);
  console.log(`Total Tasks: ${totalTasks} (Expected: 168)`);

  const d1 = verifyRoadmap.modules[0].roadmapDays[0];
  console.log(`\nVerification of Day 1:`);
  console.log(`- Title: ${d1.title}`);
  console.log(`- Objective: ${d1.objective}`);
  d1.tasks.forEach((t) => console.log(`  * [${t.taskType}] ${t.title} (${t.estimatedDuration}m)`));

  const d8 = verifyRoadmap.modules[1].roadmapDays[0];
  console.log(`\nVerification of Day 8 (Week 2):`);
  console.log(`- Title: ${d8.title}`);
  console.log(`- Objective: ${d8.objective}`);
  d8.tasks.forEach((t) => console.log(`  * [${t.taskType}] ${t.title} (${t.estimatedDuration}m)`));

  const d56 = verifyRoadmap.modules[7].roadmapDays[6];
  console.log(`\nVerification of Day 56 (Final Day of Week 8):`);
  console.log(`- Title: ${d56.title}`);
  console.log(`- Objective: ${d56.objective}`);
  d56.tasks.forEach((t) => console.log(`  * [${t.taskType}] ${t.title} (${t.estimatedDuration}m)`));

  console.log(`\nCompleted in ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
}

updateMernCurriculum()
  .catch((err) => {
    console.error('❌ Update failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
