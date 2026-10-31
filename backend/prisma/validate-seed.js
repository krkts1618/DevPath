import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function validateSeed() {
  console.log('🔍 Running Comprehensive DevPath Database Validation Audit...\n');
  let hasErrors = false;
  const issues = [];

  // 1. Category Count
  const categories = await prisma.roadmapCategory.findMany({
    orderBy: { displayOrder: 'asc' },
    include: { _count: { select: { roadmaps: true } } },
  });
  console.log(`📊 1. Roadmap Categories: ${categories.length} (Expected: 6)`);
  if (categories.length < 6) {
    issues.push(`Expected at least 6 categories, found ${categories.length}`);
    hasErrors = true;
  }
  categories.forEach((c) => {
    console.log(`   - [${c.slug}] "${c.name}" -> ${c._count.roadmaps} roadmaps`);
  });

  // 2. Roadmap Count
  const roadmaps = await prisma.roadmap.findMany({
    orderBy: { displayOrder: 'asc' },
    include: {
      category: true,
      modules: { orderBy: { startingDay: 'asc' } },
      roadmapDays: {
        orderBy: { dayNumber: 'asc' },
        include: {
          tasks: true,
        },
      },
    },
  });
  console.log(`\n🗺️  2. Roadmaps: ${roadmaps.length} (Expected: 10)`);
  if (roadmaps.length < 10) {
    issues.push(`Expected 10 roadmaps, found ${roadmaps.length}`);
    hasErrors = true;
  }

  // Total modules and tasks across entire database
  let totalModules = 0;
  let totalDays = 0;
  let totalTasks = 0;

  console.log('\n📋 3. Detailed Per-Roadmap Audit:');
  console.log('---------------------------------------------------------------------------------------------------------');
  console.log('| # | Roadmap Title                        | Expected Days | Actual Days | Modules | Tasks | Validation  |');
  console.log('---------------------------------------------------------------------------------------------------------');

  for (let idx = 0; idx < roadmaps.length; idx++) {
    const rm = roadmaps[idx];
    totalModules += rm.modules.length;
    totalDays += rm.roadmapDays.length;
    
    let rmTasksCount = 0;
    const dayNumbers = rm.roadmapDays.map((d) => d.dayNumber);
    const daySet = new Set();
    const duplicateDays = [];
    const emptyDays = [];
    const missingTaskTitles = [];

    // Check duplicate and empty days
    for (const day of rm.roadmapDays) {
      if (daySet.has(day.dayNumber)) {
        duplicateDays.push(day.dayNumber);
      }
      daySet.add(day.dayNumber);

      if (!day.tasks || day.tasks.length === 0) {
        emptyDays.push(day.dayNumber);
      } else {
        rmTasksCount += day.tasks.length;
        day.tasks.forEach((t) => {
          if (!t.title || t.title.trim() === '') {
            missingTaskTitles.push(`Day ${day.dayNumber}: Task ${t.id}`);
          }
        });
      }
    }
    totalTasks += rmTasksCount;

    // Check missing days from 1 to rm.duration
    const missingDays = [];
    for (let d = 1; d <= rm.duration; d++) {
      if (!daySet.has(d)) {
        missingDays.push(d);
      }
    }

    // Check module ranges
    const invalidModules = [];
    for (const m of rm.modules) {
      if (m.startingDay < 1 || m.endingDay > rm.duration || m.startingDay > m.endingDay) {
        invalidModules.push(`"${m.title}" (${m.startingDay}-${m.endingDay})`);
      }
    }

    let status = '✅ PASS';
    if (
      rm.roadmapDays.length !== rm.duration ||
      missingDays.length > 0 ||
      duplicateDays.length > 0 ||
      emptyDays.length > 0 ||
      missingTaskTitles.length > 0 ||
      invalidModules.length > 0
    ) {
      status = '❌ FAIL';
      hasErrors = true;
      if (rm.roadmapDays.length !== rm.duration) {
        issues.push(`[${rm.slug}] Day count mismatch: expected ${rm.duration}, got ${rm.roadmapDays.length}`);
      }
      if (missingDays.length > 0) {
        issues.push(`[${rm.slug}] Missing day numbers: ${missingDays.join(', ')}`);
      }
      if (duplicateDays.length > 0) {
        issues.push(`[${rm.slug}] Duplicate day numbers: ${duplicateDays.join(', ')}`);
      }
      if (emptyDays.length > 0) {
        issues.push(`[${rm.slug}] Empty days with zero tasks: ${emptyDays.join(', ')}`);
      }
      if (missingTaskTitles.length > 0) {
        issues.push(`[${rm.slug}] Missing task titles: ${missingTaskTitles.join(', ')}`);
      }
      if (invalidModules.length > 0) {
        issues.push(`[${rm.slug}] Invalid module ranges: ${invalidModules.join(', ')}`);
      }
    }

    const titleCol = rm.title.padEnd(36).slice(0, 36);
    const expDaysCol = String(rm.duration).padStart(13);
    const actDaysCol = String(rm.roadmapDays.length).padStart(11);
    const modsCol = String(rm.modules.length).padStart(7);
    const tasksCol = String(rmTasksCount).padStart(5);
    console.log(`| ${(idx + 1).toString().padStart(1)} | ${titleCol} | ${expDaysCol} | ${actDaysCol} | ${modsCol} | ${tasksCol} | ${status}    |`);
  }
  console.log('---------------------------------------------------------------------------------------------------------');

  console.log(`\n📈 Database Totals:`);
  console.log(`   - Categories: ${categories.length}`);
  console.log(`   - Roadmaps:   ${roadmaps.length}`);
  console.log(`   - Modules:    ${totalModules}`);
  console.log(`   - Days:       ${totalDays}`);
  console.log(`   - Tasks:      ${totalTasks}`);

  if (hasErrors) {
    console.error('\n❌ VALIDATION AUDIT FAILED with issues:');
    issues.forEach((err, i) => console.error(`  ${i + 1}. ${err}`));
    process.exit(1);
  } else {
    console.log('\n✅ ALL 10 CURRICULUM AUDIT CRITERIA PASSED FLAWLESSLY!');
  }
}

validateSeed()
  .catch((e) => {
    console.error('Fatal error during validation:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
