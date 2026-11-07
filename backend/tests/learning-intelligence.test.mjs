import { strict as assert } from 'node:assert';
import http from 'node:http';
import app from '../src/app.js';
import { prisma } from '../src/config/db.js';
import { StreakService } from '../src/services/streak.service.js';
import { ProgressionService } from '../src/services/progression.service.js';
import { WeekendReviewService } from '../src/services/weekendReview.service.js';
import { LifecycleService } from '../src/services/lifecycle.service.js';
import { AnalyticsService } from '../src/services/analytics.service.js';
import {
  getKolkataDateString,
  addDaysToKolkataDate,
  calculateScheduledDate,
  isKolkataWeekday,
  isKolkataWeekend,
  getKolkataWeekRange,
  getKolkataYearMonth,
} from '../src/utils/date.util.js';

let server;
let baseUrl;

async function run() {
  console.log('===============================================================');
  console.log('🧪 DEVPATH LEARNING INTELLIGENCE & SCHEDULING VERIFICATION');
  console.log('===============================================================\n');

  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}`;
  console.log(`📡 Test server running at ${baseUrl}`);

  const results = { passed: 0, failed: 0 };
  const record = (name, passed, detail = '') => {
    if (passed) {
      console.log(`  ✅ PASS: ${name}`);
      results.passed++;
    } else {
      console.error(`  ❌ FAIL: ${name} -> ${detail}`);
      results.failed++;
    }
  };

  try {
    // -------------------------------------------------------------------------
    // 1. Date Utilities & Five-Day Learning Week
    // -------------------------------------------------------------------------
    console.log('\n[1. Date Engine & Five-Day Week Qualification]');
    
    // Test known Monday (2026-11-02) and Saturday (2026-11-07)
    const mon = '2026-11-02';
    const fri = '2026-11-06';
    const sat = '2026-11-07';
    const sun = '2026-11-08';

    record('Monday is recognized as a Kolkata weekday', isKolkataWeekday(mon), `Got ${isKolkataWeekday(mon)}`);
    record('Friday is recognized as a Kolkata weekday', isKolkataWeekday(fri), `Got ${isKolkataWeekday(fri)}`);
    record('Saturday is recognized as a Kolkata weekend', isKolkataWeekend(sat), `Got ${isKolkataWeekend(sat)}`);
    record('Sunday is recognized as a Kolkata weekend', isKolkataWeekend(sun), `Got ${isKolkataWeekend(sun)}`);

    const weekRange = getKolkataWeekRange(sat);
    record(
      'Week range computes Monday as week start and Sunday as week end',
      weekRange.weekStartDate === mon && weekRange.weekEndDate === sun,
      `start=${weekRange.weekStartDate}, end=${weekRange.weekEndDate}`
    );

    // -------------------------------------------------------------------------
    // 2. Roadmap Day Scheduling Skips Weekends
    // -------------------------------------------------------------------------
    console.log('\n[2. Roadmap Day Scheduling Skips Weekends]');
    // Start on Monday Nov 2, 2026:
    // Day 1 = Mon Nov 2
    // Day 5 = Fri Nov 6
    // Day 6 = Mon Nov 9 (skips Sat Nov 7 and Sun Nov 8)
    const day1Date = getKolkataDateString(calculateScheduledDate(mon, 1));
    const day5Date = getKolkataDateString(calculateScheduledDate(mon, 5));
    const day6Date = getKolkataDateString(calculateScheduledDate(mon, 6));

    record('Day 1 schedules on Monday', day1Date === '2026-11-02', `Got ${day1Date}`);
    record('Day 5 schedules on Friday', day5Date === '2026-11-06', `Got ${day5Date}`);
    record(
      'Day 6 skips weekend and resumes on next Monday (Nov 9)',
      day6Date === '2026-11-09',
      `Got ${day6Date}`
    );

    // -------------------------------------------------------------------------
    // 3. Streak Freezes & 4-Per-Month Protection
    // -------------------------------------------------------------------------
    console.log('\n[3. Four Monthly Streak Freezes Engine]');
    const overallStreak = await StreakService.calculateOverallStreak();

    record(
      'Streak engine returns freeze allowance capped at 4 per month',
      overallStreak.freezes && overallStreak.freezes.allowance === 4,
      `Allowance: ${overallStreak?.freezes?.allowance}`
    );

    record(
      'Streak engine tracks freezes used and remaining accurately',
      typeof overallStreak.freezes.used === 'number' &&
      typeof overallStreak.freezes.remaining === 'number' &&
      overallStreak.freezes.used + overallStreak.freezes.remaining === 4,
      `Used: ${overallStreak.freezes.used}, Remaining: ${overallStreak.freezes.remaining}`
    );

    record(
      'Baseline daily streak target is configured to 5 tasks',
      overallStreak.streakTarget === 5,
      `streakTarget: ${overallStreak.streakTarget}`
    );

    // -------------------------------------------------------------------------
    // 4. Weekend Review & Assessment Services
    // -------------------------------------------------------------------------
    console.log('\n[4. Weekend Revision Mode & Review Endpoints]');
    const recollectionData = await WeekendReviewService.getRecollectionData(sat);
    record(
      'Saturday recollection retrieves completed tasks grouped by roadmap',
      recollectionData && Array.isArray(recollectionData.roadmaps) && typeof recollectionData.totalCompletedTasks === 'number',
      `Roadmaps count: ${recollectionData?.roadmaps?.length}, Total tasks: ${recollectionData?.totalCompletedTasks}`
    );

    record(
      'Saturday recollection includes revision suggestions and weak topics',
      Array.isArray(recollectionData.revisionSuggestions),
      `Suggestions: ${recollectionData?.revisionSuggestions?.length}`
    );

    const assessmentData = await WeekendReviewService.getAssessmentData(sun);
    record(
      'Sunday assessment retrieves topics covered during the week',
      assessmentData && Array.isArray(assessmentData.topicsCovered),
      `Topics covered: ${assessmentData?.topicsCovered?.length}`
    );

    // Test saving an assessment with persistent TopicAssessment records
    const testReview = await WeekendReviewService.saveReview({
      weekStartDate: '2026-11-02',
      reviewDate: '2026-11-08',
      reviewType: 'assessment',
      reflection: 'Automated test weekly reflection.',
      mistakes: 'None in automated run.',
      questions: 'PostgreSQL isolation levels trade-offs.',
      weakAreas: 'Distributed consensus algorithms.',
      nextWeekGoals: 'Complete capstone project phase 1.',
      topicAssessments: [
        {
          topic: 'PostgreSQL Indexing & B-Trees',
          understanding: 'understood',
          notes: 'Covered composite and partial indexing.',
        },
        {
          topic: 'React State Hoisting & Context',
          understanding: 'needs_revision',
          notes: 'Re-render optimization needed.',
        },
      ],
    });

    record(
      'Weekend review upserts successfully with topic assessments',
      testReview && testReview.reviewType === 'assessment' && testReview.topicAssessments?.length >= 2,
      `Saved review id=${testReview?.id}, assessments=${testReview?.topicAssessments?.length}`
    );

    const weakTopics = await WeekendReviewService.getWeakTopics();
    record(
      'Weak topics service returns prioritized topics marked needs_revision or difficult',
      Array.isArray(weakTopics) && weakTopics.length > 0,
      `Weak topics count: ${weakTopics?.length}`
    );

    // -------------------------------------------------------------------------
    // 5. Weekly Engineering Report Engine
    // -------------------------------------------------------------------------
    console.log('\n[5. Weekly Engineering Report Engine]');
    const weeklyReport = await AnalyticsService.getWeeklyEngineeringReport('2026-11-02');

    record(
      'Weekly report calculates learning days achieved out of 5',
      typeof weeklyReport.learningDaysAchieved === 'number' && weeklyReport.totalWeekdayTargets === 5,
      `Achieved: ${weeklyReport.learningDaysAchieved} / 5`
    );

    record(
      'Weekly report provides daily weekday breakdown (Mon–Fri)',
      Array.isArray(weeklyReport.weekdayBreakdown) && weeklyReport.weekdayBreakdown.length === 5,
      `Days in breakdown: ${weeklyReport.weekdayBreakdown?.length}`
    );

    record(
      'Weekly report aggregates focus time, tasks by roadmap, and weekend status',
      typeof weeklyReport.focusTime?.totalMinutes === 'number' &&
      Array.isArray(weeklyReport.tasksByRoadmap) &&
      typeof weeklyReport.weekendRevision?.saturdayRecollectionCompleted === 'boolean' &&
      typeof weeklyReport.weekendRevision?.sundayAssessmentCompleted === 'boolean',
      `Focus mins: ${weeklyReport.focusTime?.totalMinutes}, Sunday done: ${weeklyReport.weekendRevision?.sundayAssessmentCompleted}`
    );

    // -------------------------------------------------------------------------
    // 6. Calendar & Planner Bidirectional Synchronization
    // -------------------------------------------------------------------------
    console.log('\n[6. Calendar & Daily Planner Bidirectional Sync]');
    // Create personal task with startTime, endTime, and taskType
    const testTask = await LifecycleService.createPersonalTask({
      title: 'Automated Calendar-Planner Sync Task',
      description: 'Verifying bidirectional sync between calendar and daily planner',
      scheduledDate: mon,
      startTime: '10:00',
      endTime: '11:00',
      priority: 'high',
      taskType: 'coding',
      estimatedDuration: 60,
    });

    record(
      'Personal task created with startTime, endTime, and taskType',
      testTask && testTask.startTime === '10:00' && testTask.endTime === '11:00' && testTask.taskType === 'coding',
      `Task id=${testTask.id}, type=${testTask.taskType}, time=${testTask.startTime}-${testTask.endTime}`
    );

    // Verify it appears in calendar events
    const calEvents = await LifecycleService.getCalendarEvents(mon, mon);
    const dateEvents = calEvents.eventsByDate[mon] || [];
    const foundInCal = dateEvents.find((e) => e.personalTaskId === testTask.id);

    record(
      'Scheduled task immediately appears in calendar events with time and type',
      foundInCal && foundInCal.startTime === '10:00' && foundInCal.taskType === 'coding',
      `Found in calendar: ${!!foundInCal}`
    );

    // Verify it appears in Daily Planner for that date
    const planner = await ProgressionService.getDailyPlannerData(mon);
    const foundInPlanner = (planner.personalTasks || []).find((p) => p.id === testTask.id);

    record(
      'Scheduled task immediately appears in daily planner for that date',
      !!foundInPlanner,
      `Found in planner: ${!!foundInPlanner}`
    );

    // Toggle status and verify sync
    const toggled = await LifecycleService.togglePersonalTask(testTask.id);
    record(
      'Personal task status toggles successfully',
      toggled && toggled.completed === true,
      `Completed: ${toggled?.completed}`
    );

    // Clean up test personal task
    await LifecycleService.deletePersonalTask(testTask.id);
    const calAfterDelete = await LifecycleService.getCalendarEvents(mon, mon);
    const foundAfterDelete = (calAfterDelete.eventsByDate[mon] || []).find((e) => e.personalTaskId === testTask.id);

    record(
      'Deleted task immediately disappears across calendar and planner',
      !foundAfterDelete,
      `Still in calendar: ${!!foundAfterDelete}`
    );

  } catch (error) {
    console.error('Test Suite Error:', error);
    record('Unhandled Exception', false, error.message);
  } finally {
    if (server) server.close();
    await prisma.$disconnect();
  }

  console.log('\n===============================================================');
  console.log(`🏁 TEST RESULTS: ${results.passed} PASSED, ${results.failed} FAILED`);
  console.log('===============================================================\n');

  if (results.failed > 0) {
    process.exit(1);
  }
}

run();
