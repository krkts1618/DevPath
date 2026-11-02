import { prisma } from '../src/config/db.js';
import { aptitudeModules, aptitudeDayRows } from '../prisma/data/curriculum-aptitude.js';

const TARGET_ROADMAP_ID = 'be1c41d8-c33b-43dc-b1b6-83ae8c39c7a1';
const TARGET_SLUG = 'aptitude-logical-reasoning';

async function updateAptitudeCurriculum() {
  console.log('🚀 Starting Aptitude + Logical Reasoning Curriculum Update...');
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
      title: 'Aptitude + Logical Reasoning',
      description:
        '84-day comprehensive quantitative aptitude and logical reasoning progression covering calculation basics, ratios, averages, profit/loss, interest, work, speed, number systems, algebra, probability, data interpretation, and placement mocks (420+ targeted practice questions).',
      duration: 84,
      targetDailyStudyTime: 45,
    },
  });
  console.log('✓ Roadmap metadata updated.');

  // 3. Upsert the 12 Modules (Weeks 1 to 12)
  const moduleMap = new Map();
  const existingModules = roadmap.modules.sort((a, b) => a.startingDay - b.startingDay);

  for (let idx = 0; idx < aptitudeModules.length; idx++) {
    const m = aptitudeModules[idx];
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

  // 4. Upsert 84 Days and 252 Checklist Tasks
  const existingDaysMap = new Map();
  roadmap.roadmapDays.forEach((d) => existingDaysMap.set(d.dayNumber, d));

  console.log('Syncing 84 Days and 252 Checklist Tasks...');

  for (const row of aptitudeDayRows) {
    const modIdx = aptitudeModules.findIndex((m) => row.day >= m.startingDay && row.day <= m.endingDay);
    const mod = moduleMap.get(modIdx);

    const isTestDay = row.day % 7 === 0;
    const isPracticeDay = row.day % 7 === 6;

    const dayTitle = `Day ${row.day}: ${row.topic}`;
    const dayObjective = row.concepts;
    const dayType = isTestDay ? 'project' : isPracticeDay ? 'practice' : 'learning';

    let dayRecord = existingDaysMap.get(row.day);

    if (dayRecord) {
      dayRecord = await prisma.roadmapDay.update({
        where: { id: dayRecord.id },
        data: {
          moduleId: mod.id,
          title: dayTitle,
          objective: dayObjective,
          estimatedStudyTime: 45,
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
          estimatedStudyTime: 45,
          dayType: dayType,
        },
      });
    }

    // Delete any completions attached to existing tasks of this day
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

    let checklist;
    if (row.day === 83) {
      checklist = [
        { title: 'Combined placement-style mock — use your full 30 minutes', type: 'project', dur: 30, desc: 'Complete full 30-minute placement mock simulating real IT and product company test conditions.' },
        { title: 'Evaluate section timing, question selection accuracy, and negative marking impact', type: 'practice', dur: 10, desc: 'Assess time spent per question and benchmark against cutoff criteria.' },
        { title: 'Record overall score, percentile, and rank target in placement preparation log', type: 'revise', dur: 5, desc: 'Log final metrics and highlight topics requiring quick formula review.' },
      ];
    } else if (row.day === 84) {
      checklist = [
        { title: 'Final analysis, formula recall and next-step planning', type: 'revise', dur: 20, desc: 'Conduct comprehensive performance analysis across all 12 weeks of training.' },
        { title: 'Rapid-fire formula and mental calculation recall drill across all 12 modules', type: 'practice', dur: 15, desc: 'Review complete formula sheet: percentages, SI/CI, work, speed, permutations, and clock angles.' },
        { title: 'Establish company-specific aptitude strategy (TCS, Infosys, Cognizant, Wipro, Product firms)', type: 'learn', dur: 10, desc: 'Plan weekly maintenance tests to sustain peak speed and accuracy.' },
      ];
    } else if (row.day === 81) {
      checklist = [
        { title: 'Review the test and redo incorrect questions', type: 'revise', dur: 25, desc: 'Rework every incorrect and unattempted question from Day 80 without looking at solutions.' },
        { title: 'Study official step-by-step explanations and document root cause of errors', type: 'learn', dur: 10, desc: 'Differentiate between calculation slip-ups vs conceptual misunderstandings.' },
        { title: 'Re-test 2 similar questions to verify conceptual mastery', type: 'practice', dur: 10, desc: 'Ensure 100% confidence on all tested problem patterns.' },
      ];
    } else if (isTestDay) {
      checklist = [
        { title: `Complete Weekly Mini-Test: ${row.task}`, type: 'practice', dur: 25, desc: `Take timed ${row.qCount}-question assessment covering this week's core problem types.` },
        { title: 'Analyze all incorrect and unattempted questions with step-by-step solutions', type: 'revise', dur: 12, desc: 'Identify time traps and log mistake categories in error tracker.' },
        { title: 'Update formula quick-reference sheet and consolidate weekly concepts', type: 'learn', dur: 8, desc: 'Solidify shortcut formulas and mental models before starting the next week.' },
      ];
    } else if (isPracticeDay) {
      checklist = [
        { title: `Solve: ${row.task}`, type: 'practice', dur: 25, desc: `Complete ${row.qCount} mixed problems under timed conditions (approx. 1.5 - 2 mins per question).` },
        { title: 'Analyze question selection strategy: speed vs accuracy trade-offs', type: 'learn', dur: 10, desc: 'Evaluate which questions to attempt first and which to skip on initial pass.' },
        { title: 'Log time-consuming question patterns and document alternative shortcuts', type: 'revise', dur: 10, desc: 'Refine mental math and elimination techniques for complex problems.' },
      ];
    } else {
      checklist = [
        { title: `Solve: ${row.task}`, type: 'code', dur: 20, desc: `Solve ${row.qCount} targeted questions focusing on ${row.topic}.` },
        { title: 'Apply shortcut methods, mental math calculations, and elimination techniques', type: 'practice', dur: 15, desc: `Practice fast calculation techniques and pattern recognition for ${row.topic}.` },
        { title: 'Review solutions, log calculation errors, and verify core formulas', type: 'learn', dur: 10, desc: 'Ensure zero unresolved doubts and record tricky questions in revision notebook.' },
      ];
    }

    await prisma.task.createMany({
      data: checklist.map((t, idx) => ({
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
  console.log('🎉 APTITUDE + LOGICAL REASONING CURRICULUM UPDATE COMPLETE & VERIFIED');
  console.log('======================================================');
  console.log(`Roadmap Title: ${verifyRoadmap.title}`);
  console.log(`Modules Count: ${verifyRoadmap.modules.length} (Expected: 12)`);
  console.log(`Days Count: ${totalDays} (Expected: 84)`);
  console.log(`Total Tasks: ${totalTasks} (Expected: 252)`);

  const d1 = verifyRoadmap.modules[0].roadmapDays[0];
  console.log(`\nVerification of Day 1:`);
  console.log(`- Title: ${d1.title}`);
  console.log(`- Objective: ${d1.objective}`);
  d1.tasks.forEach((t) => console.log(`  * [${t.taskType}] ${t.title} (${t.estimatedDuration}m)`));

  const d84 = verifyRoadmap.modules[11].roadmapDays[6];
  console.log(`\nVerification of Day 84 (Final Day of Week 12):`);
  console.log(`- Title: ${d84.title}`);
  console.log(`- Objective: ${d84.objective}`);
  d84.tasks.forEach((t) => console.log(`  * [${t.taskType}] ${t.title} (${t.estimatedDuration}m)`));

  console.log(`\nCompleted in ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
}

updateAptitudeCurriculum()
  .catch((err) => {
    console.error('❌ Update failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
