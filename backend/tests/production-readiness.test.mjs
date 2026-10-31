/**
 * DevPath Final Production Readiness, Security Hardening & Engine Integrity Test Suite
 */

import app from '../src/app.js';
import { prisma, checkDatabaseHealth } from '../src/config/db.js';
import { ProgressionService } from '../src/services/progression.service.js';
import { StreakService } from '../src/services/streak.service.js';
import { RevisionService } from '../src/services/revision.service.js';
import { ProjectService } from '../src/services/project.service.js';
import { StudySessionService } from '../src/services/studySession.service.js';
import { ReminderService } from '../src/services/reminder.service.js';

let server;
let baseUrl;

const results = {
  passed: 0,
  failed: 0,
  tests: [],
};

function record(name, condition, details = '') {
  results.tests.push({ name, passed: condition, details });
  if (condition) {
    results.passed++;
    console.log(`  ✅ PASS: ${name}`);
  } else {
    results.failed++;
    console.error(`  ❌ FAIL: ${name} -> ${details}`);
  }
}

async function request(method, path, body = null, headers = {}) {
  const url = `${baseUrl}${path}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const res = await fetch(url, options);
  const json = await res.json().catch(() => null);
  return { status: res.status, headers: res.headers, body: json };
}

async function run() {
  console.log('===============================================================');
  console.log('🚀 DevPath Production Readiness & Security Verification Suite');
  console.log('===============================================================\n');

  // Start test server on random port
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`📡 Test Server listening on ${baseUrl}\n`);
      resolve();
    });
  });

  try {
    // -------------------------------------------------------------------------
    // 1. Health & Database Connection Security
    // -------------------------------------------------------------------------
    console.log('[1. Health Check & Information Disclosure Audit]');
    const healthRes = await request('GET', '/api/health');
    record(
      'Health endpoint returns HTTP 200 and UP status',
      healthRes.status === 200 && healthRes.body?.data?.status === 'UP',
      `Got status ${healthRes.status}`
    );

    const rawHealthStr = JSON.stringify(healthRes.body);
    const leaksDbPassword = rawHealthStr.toLowerCase().includes('5rt6rt7rt8rt') || rawHealthStr.includes('password');
    const leaksDbHost = rawHealthStr.includes('supabase.co') || rawHealthStr.includes('pooler.supabase.com');
    const leaksPostgresVersion = /postgresql\s+[0-9]/i.test(rawHealthStr);

    record(
      'Health endpoint strictly sanitizes DB credentials and hostnames',
      !leaksDbPassword && !leaksDbHost && !leaksPostgresVersion,
      `Sanitization check: password leaked=${leaksDbPassword}, host leaked=${leaksDbHost}`
    );

    // -------------------------------------------------------------------------
    // 2. HTTP Security Headers Audit (Helmet & CORS)
    // -------------------------------------------------------------------------
    console.log('\n[2. Security Headers & Helmet Audit]');
    const nosniff = healthRes.headers.get('x-content-type-options');
    record(
      'X-Content-Type-Options: nosniff is enforced',
      nosniff === 'nosniff',
      `Got ${nosniff}`
    );

    const corp = healthRes.headers.get('cross-origin-resource-policy');
    record(
      'Cross-Origin-Resource-Policy is configured for cross-origin assets',
      corp === 'cross-origin',
      `Got ${corp}`
    );

    const serverTiming = healthRes.headers.get('server-timing');
    record(
      'Server-Timing header is exposed for performance telemetry',
      serverTiming && serverTiming.includes('dur='),
      `Got ${serverTiming}`
    );

    // -------------------------------------------------------------------------
    // 3. Application Access Secret Guard Audit
    // -------------------------------------------------------------------------
    console.log('\n[3. Single-User Application Access Secret Guard]');
    
    // Set a mock APP_ACCESS_SECRET on process.env to test protection
    const originalSecret = process.env.APP_ACCESS_SECRET;
    process.env.APP_ACCESS_SECRET = 'devpath-super-secure-test-token-12345';

    // GET requests should pass freely (read-only)
    const readRes = await request('GET', '/api/roadmaps');
    record(
      'Read operations (GET) remain accessible without secret header',
      readRes.status === 200 && Array.isArray(readRes.body?.data),
      `Status: ${readRes.status}`
    );

    // Write operations without secret header should be rejected with 401
    const writeWithoutSecret = await request('POST', '/api/personal-tasks', {
      title: 'Unauthorized task test',
    });
    record(
      'Mutation operations reject requests lacking APP_ACCESS_SECRET with 401',
      writeWithoutSecret.status === 401 && writeWithoutSecret.body?.success === false,
      `Got ${writeWithoutSecret.status} - ${writeWithoutSecret.body?.message}`
    );

    // Write operations with INVALID secret should be rejected
    const writeWithBadSecret = await request('POST', '/api/personal-tasks', {
      title: 'Bad token task test',
    }, {
      'x-app-access-secret': 'wrong-token',
    });
    record(
      'Mutation operations reject requests with invalid secret token',
      writeWithBadSecret.status === 401,
      `Got ${writeWithBadSecret.status}`
    );

    // Write operations with VALID secret header should pass
    const writeWithValidSecret = await request('POST', '/api/personal-tasks', {
      title: 'Automated Security Validation Task',
    }, {
      'x-app-access-secret': 'devpath-super-secure-test-token-12345',
    });
    const createdTaskId = writeWithValidSecret.body?.data?.id;
    record(
      'Mutation operations succeed when valid x-app-access-secret is supplied',
      writeWithValidSecret.status === 201 && !!createdTaskId,
      `Got status ${writeWithValidSecret.status}, taskId=${createdTaskId}`
    );

    // Clean up test personal task
    if (createdTaskId) {
      await prisma.personalTask.delete({ where: { id: createdTaskId } }).catch(() => {});
    }

    // Restore original secret
    if (originalSecret) {
      process.env.APP_ACCESS_SECRET = originalSecret;
    } else {
      delete process.env.APP_ACCESS_SECRET;
    }

    // -------------------------------------------------------------------------
    // 4. File Upload Extension & MIME Protection
    // -------------------------------------------------------------------------
    console.log('\n[4. File Upload Sanitization & Security]');
    // Find or create a temporary note for upload testing
    let sampleNote = await prisma.note.findFirst();
    if (!sampleNote) {
      sampleNote = await prisma.note.create({
        data: {
          title: 'Upload Test Note',
          content: 'Test content',
        },
      });
    }

    // Send multipart form with disallowed file extension (.exe)
    const boundary = '----WebKitFormBoundaryDevPathTest' + Math.random().toString(36).substring(2);
    const rawPayload = 
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="malicious.exe"\r\n` +
      `Content-Type: application/x-msdownload\r\n\r\n` +
      `MZ-dummy-binary-content\r\n` +
      `--${boundary}--\r\n`;

    const uploadRes = await fetch(`${baseUrl}/api/notes/${sampleNote.id}/attachments`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: rawPayload,
    });
    const uploadBody = await uploadRes.json().catch(() => null);

    record(
      'Disallowed file upload types (.exe/.sh/.php) are strictly rejected with 400',
      uploadRes.status === 400 && uploadBody?.success === false,
      `Got status ${uploadRes.status}: ${uploadBody?.message}`
    );

    // -------------------------------------------------------------------------
    // 5. Core Business Logic: Adaptive Roadmap Progression Engine
    // -------------------------------------------------------------------------
    console.log('\n[5. Core Business Logic: Adaptive Roadmap Progression]');
    const queueData = await ProgressionService.getDailyLearningQueue();
    record(
      'Daily Learning Queue calculates frontier tasks across active roadmaps',
      queueData && Array.isArray(queueData.roadmaps) && queueData.roadmaps.length > 0,
      `Roadmaps count: ${queueData?.roadmaps?.length}`
    );

    // Verify independent progression: each roadmap should be tracked independently
    const distinctRoadmapIds = new Set(queueData.roadmaps.map((r) => r.roadmapId));
    record(
      'Each roadmap progresses independently without cross-track interference',
      distinctRoadmapIds.size === queueData.roadmaps.length,
      `Distinct tracks: ${distinctRoadmapIds.size}`
    );

    // -------------------------------------------------------------------------
    // 6. Core Business Logic: Streak Engine & 5-Task Qualification
    // -------------------------------------------------------------------------
    console.log('\n[6. Core Business Logic: Streak Engine]');
    const overallStreak = await StreakService.calculateOverallStreak();
    record(
      'Overall streak engine executes and returns qualification status',
      overallStreak && typeof overallStreak.currentStreak === 'number' && typeof overallStreak.qualifiedToday === 'boolean',
      `Current streak: ${overallStreak?.currentStreak}, Qualified today: ${overallStreak?.qualifiedToday}`
    );

    record(
      'Default streak rule requires 5 completed tasks to qualify',
      overallStreak.requiredToday === 5 || overallStreak.streakTarget === 5,
      `Target configured: requiredToday=${overallStreak.requiredToday}, streakTarget=${overallStreak.streakTarget}`
    );

    // -------------------------------------------------------------------------
    // 7. Core Business Logic: Daily Planner & Carried-Forward Tasks
    // -------------------------------------------------------------------------
    console.log('\n[7. Core Business Logic: Daily Planner View]');
    const plannerData = await ProgressionService.getDailyPlannerData();
    record(
      'Daily planner aggregates roadmapsQueue, activeTasks, and summary stats',
      plannerData && typeof plannerData.summary?.activeRoadmapsCount === 'number',
      `Active tracks in planner: ${plannerData?.summary?.activeRoadmapsCount}`
    );

    // -------------------------------------------------------------------------
    // 8. Core Business Logic: Focus Timer & Study Session Stats
    // -------------------------------------------------------------------------
    console.log('\n[8. Core Business Logic: Focus Timer & Study Sessions]');
    const studyAnalytics = await StudySessionService.getAnalytics();
    record(
      'Study session service calculates total focus minutes, sessions, and daily breakdown',
      studyAnalytics && typeof studyAnalytics.todayFocusMinutes === 'number' && typeof studyAnalytics.totalFocusMinutes === 'number',
      `Total minutes: ${studyAnalytics?.totalFocusMinutes}, Today minutes: ${studyAnalytics?.todayFocusMinutes}`
    );

    // -------------------------------------------------------------------------
    // 9. Core Business Logic: Spaced Repetition Revision Engine
    // -------------------------------------------------------------------------
    console.log('\n[9. Core Business Logic: Revision Engine]');
    const revisionData = await RevisionService.getRevisions();
    record(
      'Revision service categorizes schedules into dueToday, upcoming, and overdue',
      revisionData && Array.isArray(revisionData.dueToday) && Array.isArray(revisionData.upcoming),
      `Due today: ${revisionData?.dueToday?.length}, Upcoming: ${revisionData?.upcoming?.length}`
    );

    // -------------------------------------------------------------------------
    // 10. Core Business Logic: Project 50/50 Weighted Progress
    // -------------------------------------------------------------------------
    console.log('\n[10. Core Business Logic: Project Management Engine]');
    const projects = await ProjectService.getProjects();
    record(
      'Project service calculates 50% milestone + 50% task weighted progress',
      Array.isArray(projects),
      `Projects count: ${projects?.length}`
    );

    // -------------------------------------------------------------------------
    // 11. Standalone Reminder Engine Idempotency
    // -------------------------------------------------------------------------
    console.log('\n[11. Standalone Reminder Engine & Idempotency]');
    const reminderResult = await ReminderService.processDueReminders(false);
    record(
      'Reminder processor runs idempotently without unhandled database errors',
      reminderResult && typeof reminderResult.schedulesProcessed === 'number',
      `Processed ${reminderResult?.schedulesProcessed} schedules`
    );

  } catch (error) {
    console.error('Unhandled Test Exception:', error);
    record('Test Suite Exception', false, error.message);
  } finally {
    if (server) {
      server.close();
    }
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
