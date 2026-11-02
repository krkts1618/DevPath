import { prisma } from '../src/config/db.js';
import { javaModules, dayDefinitions } from '../prisma/data/curriculum-java-spring.js';

const TARGET_ROADMAP_ID = '0b9059fe-7c05-4c6c-8e7e-b8f51d1de942';
const TARGET_SLUG = 'java-spring-boot';

async function updateJavaSpringCurriculum() {
  console.log('🚀 Starting Java + Spring Boot Curriculum Update...');
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

  // 2. Update Roadmap metadata and set status to active so it appears in Learning Tracks sidebar
  await prisma.roadmap.update({
    where: { id: roadmap.id },
    data: {
      title: 'Java + Spring Boot',
      description:
        '10-week (70-day) enterprise backend and full-stack engineering progression covering Spring Boot foundations, layered REST architecture, SQL/JPA/Hibernate, reliable APIs, automated testing, Spring Security 6 & JWT, Docker containerization, React integration, and the PaperScope Open Research Collaboration Platform.',
      duration: 70,
      targetDailyStudyTime: 90,
      status: 'active',
    },
  });
  console.log('✓ Roadmap metadata updated & status set to ACTIVE.');

  // 3. Upsert the 10 Modules (Weeks 1 to 10)
  const moduleMap = new Map(); // week index -> Module record
  const existingModules = roadmap.modules.sort((a, b) => a.startingDay - b.startingDay);

  for (let idx = 0; idx < javaModules.length; idx++) {
    const m = javaModules[idx];
    const existingMod = existingModules[idx];

    let modRecord;
    if (existingMod) {
      modRecord = await prisma.module.update({
        where: { id: existingMod.id },
        data: {
          title: m.title,
          description: m.description,
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
          description: m.description,
          startingDay: m.startingDay,
          endingDay: m.endingDay,
          displayOrder: idx + 1,
        },
      });
    }
    moduleMap.set(idx, modRecord);
    console.log(`  ✓ Updated Module ${idx + 1}: "${m.title}" (Days ${m.startingDay}-${m.endingDay})`);
  }

  // 4. Upsert 70 Days and 210 Checklist Tasks
  const existingDaysMap = new Map();
  roadmap.roadmapDays.forEach((d) => existingDaysMap.set(d.dayNumber, d));

  console.log('Syncing 70 Days and 210 Checklist Tasks...');

  for (const dayDef of dayDefinitions) {
    const mod = moduleMap.get(dayDef.moduleIndex);
    const dayTitle = `Day ${dayDef.dayNumber}: ${dayDef.title}`;
    const dayObjective = dayDef.objective;
    const dayType = dayDef.dayNumber % 7 === 0 ? 'project' : dayDef.dayNumber % 6 === 0 ? 'practice' : 'learning';

    let dayRecord = existingDaysMap.get(dayDef.dayNumber);

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
          dayNumber: dayDef.dayNumber,
          title: dayTitle,
          objective: dayObjective,
          estimatedStudyTime: 90,
          dayType: dayType,
        },
      });
    }

    // Safely delete existing task completions then tasks for this day
    const existingTasks = await prisma.task.findMany({
      where: { roadmapDayId: dayRecord.id },
      select: { id: true },
    });

    if (existingTasks.length > 0) {
      const taskIds = existingTasks.map((t) => t.id);
      await prisma.taskCompletion.deleteMany({
        where: { taskId: { in: taskIds } },
      });
      await prisma.task.deleteMany({
        where: { id: { in: taskIds } },
      });
    }

    // Create the 3 actionable checklist tasks
    await prisma.task.createMany({
      data: dayDef.tasks.map((t, idx) => ({
        roadmapDayId: dayRecord.id,
        title: t.title,
        description: t.desc,
        taskType: t.type,
        estimatedDuration: t.dur,
        displayOrder: idx + 1,
        isRequired: true,
      })),
    });

    if (dayDef.dayNumber % 7 === 0) {
      console.log(`  ✓ Synced through Week ${dayDef.dayNumber / 7} (Day ${dayDef.dayNumber})`);
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

  console.log('\n=======================================');
  console.log('✅ Java + Spring Boot Roadmap Update Complete!');
  console.log(`Roadmap Title: ${verifyRoadmap.title}`);
  console.log(`Status: ${verifyRoadmap.status}`);
  console.log(`Modules Count: ${verifyRoadmap.modules.length}`);
  console.log(`Total Days: ${totalDays}`);
  console.log(`Total Checklist Tasks: ${totalTasks}`);
  console.log(`Elapsed Time: ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
  console.log('=======================================\n');

  // Verify Day 1, Day 7, Day 14, Day 57, and Day 70
  const sampleDays = [1, 7, 14, 57, 70];
  console.log('Sample Day Verification:');
  for (const dNum of sampleDays) {
    const day = verifyRoadmap.modules
      .flatMap((m) => m.roadmapDays)
      .find((d) => d.dayNumber === dNum);
    if (day) {
      console.log(`\nDay ${day.dayNumber}: ${day.title}`);
      console.log(`  Objective: ${day.objective}`);
      day.tasks.forEach((t) => {
        console.log(`    - [${t.taskType}] ${t.title} (${t.estimatedDuration}m)`);
      });
    }
  }
}

updateJavaSpringCurriculum()
  .catch((err) => {
    console.error('❌ Error updating Java + Spring Boot roadmap:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
