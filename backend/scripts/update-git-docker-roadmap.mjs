import { prisma } from '../src/config/db.js';
import { gitDockerModules, gitDockerDayRows } from '../prisma/data/curriculum-git-docker.js';

const TARGET_ROADMAP_ID = 'd3b70a6a-4660-44d3-b419-e3f8457b8a5f';
const TARGET_SLUG = 'git-github-docker';

async function updateGitDockerCurriculum() {
  console.log('🚀 Starting Git + GitHub + Docker Curriculum Update...');
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
      title: 'Git + GitHub + Docker',
      description:
        '28-day hands-on mastery of Git internals, branching, conflict resolution, GitHub collaboration, PR reviews, CI workflows, Docker containerization, and multi-service Docker Compose orchestration.',
      duration: 28,
      targetDailyStudyTime: 60,
    },
  });
  console.log('✓ Roadmap metadata updated.');

  // 3. Upsert 4 Modules (Weeks 1 to 4)
  const moduleMap = new Map();
  const existingModules = roadmap.modules.sort((a, b) => a.startingDay - b.startingDay);

  for (let idx = 0; idx < gitDockerModules.length; idx++) {
    const m = gitDockerModules[idx];
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

  // 4. Upsert 28 Days and 84 Checklist Tasks
  const existingDaysMap = new Map();
  roadmap.roadmapDays.forEach((d) => existingDaysMap.set(d.dayNumber, d));

  console.log('Syncing 28 Days and 84 Checklist Tasks...');

  for (const row of gitDockerDayRows) {
    const modIdx = gitDockerModules.findIndex((m) => row.day >= m.startingDay && row.day <= m.endingDay);
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
          estimatedStudyTime: 60,
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
          estimatedStudyTime: 60,
          dayType: dayType,
        },
      });
    }

    // Delete any completions attached to existing tasks of this day first
    const existingTasks = await prisma.task.findMany({
      where: { roadmapDayId: dayRecord.id },
      select: { id: true },
    });
    if (existingTasks.length > 0) {
      await prisma.taskCompletion.deleteMany({
        where: { taskId: { in: existingTasks.map((t) => t.id) } },
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
  console.log('🎉 GIT + GITHUB + DOCKER CURRICULUM UPDATE COMPLETE & VERIFIED');
  console.log('======================================================');
  console.log(`Roadmap Title: ${verifyRoadmap.title}`);
  console.log(`Modules Count: ${verifyRoadmap.modules.length} (Expected: 4)`);
  console.log(`Days Count: ${totalDays} (Expected: 28)`);
  console.log(`Total Tasks: ${totalTasks} (Expected: 84)`);

  const d1 = verifyRoadmap.modules[0].roadmapDays[0];
  console.log(`\nVerification of Day 1:`);
  console.log(`- Title: ${d1.title}`);
  console.log(`- Objective: ${d1.objective}`);
  d1.tasks.forEach((t) => console.log(`  * [${t.taskType}] ${t.title} (${t.estimatedDuration}m)`));

  const d15 = verifyRoadmap.modules[2].roadmapDays[0];
  console.log(`\nVerification of Day 15 (Docker Fundamentals):`);
  console.log(`- Title: ${d15.title}`);
  console.log(`- Objective: ${d15.objective}`);
  d15.tasks.forEach((t) => console.log(`  * [${t.taskType}] ${t.title} (${t.estimatedDuration}m)`));

  const d28 = verifyRoadmap.modules[3].roadmapDays[6];
  console.log(`\nVerification of Day 28 (Final Day):`);
  console.log(`- Title: ${d28.title}`);
  console.log(`- Objective: ${d28.objective}`);
  d28.tasks.forEach((t) => console.log(`  * [${t.taskType}] ${t.title} (${t.estimatedDuration}m)`));

  console.log(`\nCompleted in ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
}

updateGitDockerCurriculum()
  .catch((err) => {
    console.error('❌ Update failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
