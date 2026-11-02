import { prisma } from '../src/config/db.js';
import { advancedPhases, advancedDayRows } from '../prisma/data/curriculum-advanced-spec.js';

const TARGET_ROADMAP_ID = 'e28b3ab1-0c44-46d8-a9fe-833574cc9f17';
const TARGET_SLUG = 'advanced-engineering-specialization';

async function updateCurriculum() {
  console.log('🚀 Starting Curriculum Update for Advanced Engineering Specialization...');

  // 1. Find roadmap
  let roadmap = await prisma.roadmap.findUnique({
    where: { id: TARGET_ROADMAP_ID },
    include: { modules: true, roadmapDays: { include: { tasks: true } } },
  });

  if (!roadmap) {
    roadmap = await prisma.roadmap.findUnique({
      where: { slug: TARGET_SLUG },
      include: { modules: true, roadmapDays: { include: { tasks: true } } },
    });
  }

  if (!roadmap) {
    throw new Error(`Roadmap ${TARGET_ROADMAP_ID} or slug ${TARGET_SLUG} not found in database.`);
  }

  console.log(`Found Roadmap: "${roadmap.title}" (ID: ${roadmap.id})`);

  // 2. Update roadmap details
  await prisma.roadmap.update({
    where: { id: roadmap.id },
    data: {
      title: 'Advanced Engineering Specialization',
      description:
        '126-day comprehensive engineering progression covering database engineering, Node.js internals, advanced React, API engineering, performance scalability, distributed systems, security audits, AI token engineering, and full capstone deployment.',
      duration: 126,
      targetDailyStudyTime: 90,
    },
  });
  console.log('✓ Roadmap metadata updated.');

  // 3. Upsert 15 Modules
  const moduleMap = new Map(); // phaseIndex -> Module record
  const existingModules = roadmap.modules.sort((a, b) => a.startingDay - b.startingDay);

  for (let idx = 0; idx < advancedPhases.length; idx++) {
    const p = advancedPhases[idx];
    const existingMod = existingModules[idx];

    let modRecord;
    if (existingMod) {
      modRecord = await prisma.module.update({
        where: { id: existingMod.id },
        data: {
          title: p.title,
          description: p.goal,
          startingDay: p.startingDay,
          endingDay: p.endingDay,
          displayOrder: idx + 1,
        },
      });
    } else {
      modRecord = await prisma.module.create({
        data: {
          roadmapId: roadmap.id,
          title: p.title,
          description: p.goal,
          startingDay: p.startingDay,
          endingDay: p.endingDay,
          displayOrder: idx + 1,
        },
      });
    }
    moduleMap.set(idx, modRecord);
    console.log(`  ✓ Updated Module ${idx + 1}: ${p.title} (Days ${p.startingDay}-${p.endingDay})`);
  }

  // 4. Upsert 126 Days and their 3 tasks per day
  const existingDaysMap = new Map();
  roadmap.roadmapDays.forEach((d) => existingDaysMap.set(d.dayNumber, d));

  console.log('Syncing 126 Days and 378 Tasks...');

  for (const row of advancedDayRows) {
    const phaseIdx = advancedPhases.findIndex((p) => row.day >= p.startingDay && row.day <= p.endingDay);
    const mod = moduleMap.get(phaseIdx);

    const dayTitle = `Day ${row.day}: ${row.topic}`;
    const dayObjective = row.concepts;
    const dayType = row.day % 7 === 0 ? 'project' : row.day % 3 === 0 ? 'practice' : 'learning';

    let dayRecord = existingDaysMap.get(row.day);

    if (dayRecord) {
      dayRecord = await prisma.roadmapDay.update({
        where: { id: dayRecord.id },
        data: {
          moduleId: mod.id,
          title: dayTitle,
          objective: dayObjective,
          estimatedStudyTime: 90,
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
          estimatedStudyTime: 90,
          dayType: dayType,
        },
      });
    }

    // Replace tasks for this day
    await prisma.task.deleteMany({
      where: { roadmapDayId: dayRecord.id },
    });

    await prisma.task.createMany({
      data: [
        {
          roadmapDayId: dayRecord.id,
          title: `Concept Breakdown: ${row.topic}`,
          description: `Master core topics: ${row.concepts}.`,
          taskType: 'learn',
          estimatedDuration: 30,
          displayOrder: 1,
          isRequired: true,
        },
        {
          roadmapDayId: dayRecord.id,
          title: row.task,
          description: `Practical engineering task: ${row.task}`,
          taskType: row.day % 7 === 0 ? 'project' : 'code',
          estimatedDuration: 40,
          displayOrder: 2,
          isRequired: true,
        },
        {
          roadmapDayId: dayRecord.id,
          title: `Architecture Review & Key Takeaways: ${row.topic}`,
          description: `Document architecture decisions, analyze trade-offs, and verify edge-cases for ${row.topic}.`,
          taskType: 'practice',
          estimatedDuration: 20,
          displayOrder: 3,
          isRequired: true,
        },
      ],
    });

    if (row.day % 14 === 0 || row.day === 126) {
      console.log(`  ✓ Synced through Day ${row.day}`);
    }
  }

  // Verification query
  const updatedRoadmap = await prisma.roadmap.findUnique({
    where: { id: roadmap.id },
    include: {
      modules: { orderBy: { startingDay: 'asc' } },
      roadmapDays: {
        orderBy: { dayNumber: 'asc' },
        include: { tasks: { orderBy: { displayOrder: 'asc' } } },
      },
    },
  });

  console.log('\n======================================================');
  console.log('🎉 CURRICULUM UPDATE COMPLETE & VERIFIED');
  console.log('======================================================');
  console.log(`Roadmap Title: ${updatedRoadmap.title}`);
  console.log(`Modules Count: ${updatedRoadmap.modules.length} (Expected: 15)`);
  console.log(`Days Count: ${updatedRoadmap.roadmapDays.length} (Expected: 126)`);
  const totalTasks = updatedRoadmap.roadmapDays.reduce((acc, d) => acc + d.tasks.length, 0);
  console.log(`Total Tasks: ${totalTasks} (Expected: 378)`);

  console.log('\nVerification of Day 1:');
  const d1 = updatedRoadmap.roadmapDays[0];
  console.log(`- Day: ${d1.dayNumber}`);
  console.log(`- Title: ${d1.title}`);
  console.log(`- Objective: ${d1.objective}`);
  d1.tasks.forEach((t) => {
    console.log(`  * [${t.taskType}] ${t.title} (${t.estimatedDuration}m)`);
  });

  console.log('\nVerification of Day 14 (End of Phase 1):');
  const d14 = updatedRoadmap.roadmapDays[13];
  console.log(`- Day: ${d14.dayNumber}`);
  console.log(`- Title: ${d14.title}`);
  console.log(`- Objective: ${d14.objective}`);
  d14.tasks.forEach((t) => {
    console.log(`  * [${t.taskType}] ${t.title} (${t.estimatedDuration}m)`);
  });

  console.log('\nVerification of Day 126 (Final Day of Phase 15):');
  const d126 = updatedRoadmap.roadmapDays[125];
  console.log(`- Day: ${d126.dayNumber}`);
  console.log(`- Title: ${d126.title}`);
  console.log(`- Objective: ${d126.objective}`);
  d126.tasks.forEach((t) => {
    console.log(`  * [${t.taskType}] ${t.title} (${t.estimatedDuration}m)`);
  });

  process.exit(0);
}

updateCurriculum().catch((err) => {
  console.error('Update failed:', err);
  process.exit(1);
});
