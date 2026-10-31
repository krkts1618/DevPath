import { PrismaClient } from '@prisma/client';
import { initialCategories } from './data/categories.js';
import { initialRoadmaps } from './data/roadmaps.js';
import { databaseEngineeringCurriculum } from './data/curriculum-db-eng.js';
import { mernCurriculum } from './data/curriculum-mern.js';
import { javaSpringCurriculum } from './data/curriculum-java-spring.js';
import { osCurriculum } from './data/curriculum-os.js';
import { dbmsCurriculum } from './data/curriculum-dbms.js';
import { cnCurriculum } from './data/curriculum-cn.js';
import { gitDockerCurriculum } from './data/curriculum-git-docker.js';
import { aptitudeCurriculum } from './data/curriculum-aptitude.js';
import { englishCurriculum } from './data/curriculum-english.js';
import { advancedSpecCurriculum } from './data/curriculum-advanced-spec.js';

const prisma = new PrismaClient();

const allCurricula = [
  databaseEngineeringCurriculum,
  mernCurriculum,
  javaSpringCurriculum,
  osCurriculum,
  dbmsCurriculum,
  cnCurriculum,
  gitDockerCurriculum,
  aptitudeCurriculum,
  englishCurriculum,
  advancedSpecCurriculum,
];

async function seed() {
  console.log('🌱 Starting DevPath High-Performance Master Seeding Engine...');
  const startTime = Date.now();

  // 1. Seed Categories
  console.log('\n📁 [1/4] Seeding 6 Roadmap Categories...');
  const categoryMap = new Map();
  for (const cat of initialCategories) {
    const upserted = await prisma.roadmapCategory.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        displayOrder: cat.displayOrder,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        displayOrder: cat.displayOrder,
      },
    });
    categoryMap.set(cat.slug, upserted.id);
    console.log(`  ✓ Category: "${upserted.name}"`);
  }

  // 2. Seed Roadmaps
  console.log('\n🗺️  [2/4] Seeding 10 Roadmaps...');
  const roadmapMap = new Map();
  for (const rm of initialRoadmaps) {
    const categoryId = categoryMap.get(rm.categorySlug);
    if (!categoryId) {
      throw new Error(`Category ${rm.categorySlug} not found for roadmap ${rm.title}`);
    }

    const upserted = await prisma.roadmap.upsert({
      where: { slug: rm.slug },
      update: {
        categoryId,
        title: rm.title,
        description: rm.description,
        duration: rm.duration,
        targetDailyStudyTime: rm.targetDailyStudyTime,
        startDate: rm.startDate,
        status: rm.status,
        displayOrder: rm.displayOrder,
        iconIdentifier: rm.iconIdentifier,
        themeIdentifier: rm.themeIdentifier,
      },
      create: {
        categoryId,
        title: rm.title,
        slug: rm.slug,
        description: rm.description,
        duration: rm.duration,
        targetDailyStudyTime: rm.targetDailyStudyTime,
        startDate: rm.startDate,
        status: rm.status,
        displayOrder: rm.displayOrder,
        iconIdentifier: rm.iconIdentifier,
        themeIdentifier: rm.themeIdentifier,
      },
    });
    roadmapMap.set(rm.slug, upserted.id);
    console.log(`  ✓ Roadmap: "${upserted.title}" [${upserted.duration} days]`);
  }

  // 3. Batch Seed Modules, Days, and Tasks
  console.log('\n📚 [3/4] Batch Synchronizing Curriculum Content...');

  for (const curriculum of allCurricula) {
    const roadmapId = roadmapMap.get(curriculum.roadmapSlug);
    if (!roadmapId) continue;

    const rStart = Date.now();

    // A. Modules
    const moduleMap = new Map();
    for (let i = 0; i < curriculum.modules.length; i++) {
      const mod = curriculum.modules[i];
      const existing = await prisma.module.findFirst({
        where: {
          roadmapId,
          startingDay: mod.startingDay,
        },
      });

      let modRecord;
      if (existing) {
        modRecord = await prisma.module.update({
          where: { id: existing.id },
          data: {
            title: mod.title,
            description: mod.description,
            endingDay: mod.endingDay,
            displayOrder: mod.displayOrder,
          },
        });
      } else {
        modRecord = await prisma.module.create({
          data: {
            roadmapId,
            title: mod.title,
            description: mod.description,
            startingDay: mod.startingDay,
            endingDay: mod.endingDay,
            displayOrder: mod.displayOrder,
          },
        });
      }
      moduleMap.set(i, modRecord.id);
    }

    // B. Fetch existing days for this roadmap
    const existingDays = await prisma.roadmapDay.findMany({
      where: { roadmapId },
      select: { id: true, dayNumber: true },
    });
    const existingDaysMap = new Map(existingDays.map((d) => [d.dayNumber, d.id]));

    // Identify days to create vs update
    const daysToCreate = [];
    const daysToUpdate = [];

    for (const d of curriculum.days) {
      const moduleId = moduleMap.get(d.moduleIndex) || null;
      const existingId = existingDaysMap.get(d.dayNumber);
      if (existingId) {
        daysToUpdate.push({
          id: existingId,
          moduleId,
          title: d.title,
          objective: d.objective,
          estimatedStudyTime: d.estimatedStudyTime,
          dayType: d.dayType,
        });
      } else {
        daysToCreate.push({
          roadmapId,
          moduleId,
          dayNumber: d.dayNumber,
          title: d.title,
          objective: d.objective,
          estimatedStudyTime: d.estimatedStudyTime,
          dayType: d.dayType,
        });
      }
    }

    if (daysToCreate.length > 0) {
      await prisma.roadmapDay.createMany({
        data: daysToCreate,
        skipDuplicates: true,
      });
    }

    // Refresh day map
    const allDays = await prisma.roadmapDay.findMany({
      where: { roadmapId },
      select: { id: true, dayNumber: true },
    });
    const allDaysMap = new Map(allDays.map((d) => [d.dayNumber, d.id]));

    // C. Tasks synchronization
    const dayIds = Array.from(allDaysMap.values());
    const existingTasks = await prisma.task.findMany({
      where: { roadmapDayId: { in: dayIds } },
      select: { id: true, roadmapDayId: true, title: true },
    });
    const existingTasksKeySet = new Set(
      existingTasks.map((t) => `${t.roadmapDayId}:::${t.title}`)
    );

    const tasksToInsert = [];
    for (const d of curriculum.days) {
      const dayId = allDaysMap.get(d.dayNumber);
      if (!dayId) continue;

      for (const t of d.tasks) {
        const key = `${dayId}:::${t.title}`;
        if (!existingTasksKeySet.has(key)) {
          tasksToInsert.push({
            roadmapDayId: dayId,
            title: t.title,
            description: t.description,
            taskType: t.taskType,
            estimatedDuration: t.estimatedDuration,
            displayOrder: t.displayOrder,
            isRequired: true,
          });
        }
      }
    }

    if (tasksToInsert.length > 0) {
      // Insert in chunks of 500 to stay well within Postgres parameter limits
      const chunkSize = 500;
      for (let c = 0; c < tasksToInsert.length; c += chunkSize) {
        const chunk = tasksToInsert.slice(c, c + chunkSize);
        await prisma.task.createMany({
          data: chunk,
          skipDuplicates: true,
        });
      }
    }

    const rDur = ((Date.now() - rStart) / 1000).toFixed(2);
    console.log(
      `  ✓ [${curriculum.roadmapSlug}] -> ${curriculum.modules.length} mods, ${curriculum.days.length} days, +${tasksToInsert.length} new tasks (${rDur}s)`
    );
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n🎉 [4/4] DevPath Master Seeding Completed Successfully in ${durationSec}s!`);
}

seed()
  .catch((e) => {
    console.error('❌ Seeding failed with error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
