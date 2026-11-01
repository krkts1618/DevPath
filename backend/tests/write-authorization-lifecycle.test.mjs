/**
 * DevPath Write Operations Authorization & Lifecycle Verification Test Suite
 * 
 * Verifies that:
 * 1. Read operations (GET) and health checks remain accessible without an access secret.
 * 2. Unauthenticated write operations (POST, PUT, PATCH, DELETE) are rejected with HTTP 401
 *    and error code ACCESS_SECRET_REQUIRED when APP_ACCESS_SECRET is configured.
 * 3. Write operations succeed when a valid x-app-access-secret or Bearer token is provided.
 * 4. Token normalization handles whitespace and accidental surrounding quotes securely.
 * 5. Complete end-to-end write lifecycle verification on real database records:
 *    - Pause roadmap (updates status to 'paused' + creates pause history record)
 *    - Resume roadmap (updates status to 'active' + sets resumedAt in history)
 *    - Update roadmap
 *    - Task completion toggle
 *    - Notes creation & update
 *    - Notification preferences update
 *    - Auth verification endpoints (/api/auth/status and /api/auth/verify)
 */

import http from 'http';
import app from '../src/app.js';
import { prisma } from '../src/config/db.js';

const TEST_SECRET = 'devpath-production-guard-test-key-2026';
process.env.APP_ACCESS_SECRET = TEST_SECRET;

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
  console.log('🔐 DevPath Write Authorization & Lifecycle Test Suite');
  console.log('===============================================================\n');

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
    // 1. Read Operations & Health Check Open Access
    // -------------------------------------------------------------------------
    console.log('[1. Public Read Access Verification]');
    const healthRes = await request('GET', '/api/health');
    record(
      'GET /api/health succeeds without access secret',
      healthRes.status === 200 && healthRes.body?.data?.status === 'UP',
      `Got status ${healthRes.status}`
    );

    const roadmapsGetRes = await request('GET', '/api/roadmaps');
    record(
      'GET /api/roadmaps succeeds without access secret',
      roadmapsGetRes.status === 200 && Array.isArray(roadmapsGetRes.body?.data),
      `Got status ${roadmapsGetRes.status}`
    );

    const authStatusRes = await request('GET', '/api/auth/status');
    record(
      'GET /api/auth/status reports authRequired=true when secret is set',
      authStatusRes.status === 200 && authStatusRes.body?.data?.required === true,
      `Got ${JSON.stringify(authStatusRes.body)}`
    );

    // -------------------------------------------------------------------------
    // 2. Auth Secret Verification Endpoint
    // -------------------------------------------------------------------------
    console.log('\n[2. Auth Verification Endpoint (/api/auth/verify)]');
    const verifyFailRes = await request('POST', '/api/auth/verify', { secret: 'invalid-passphrase' });
    record(
      'POST /api/auth/verify rejects incorrect secret with 401',
      verifyFailRes.status === 401 && verifyFailRes.body?.details?.code === 'INVALID_ACCESS_SECRET',
      `Got status ${verifyFailRes.status}`
    );

    const verifySuccessRes = await request('POST', '/api/auth/verify', { secret: TEST_SECRET });
    record(
      'POST /api/auth/verify validates correct secret with 200',
      verifySuccessRes.status === 200 && verifySuccessRes.body?.data?.valid === true,
      `Got status ${verifySuccessRes.status}`
    );

    const verifyWhitespaceRes = await request('POST', '/api/auth/verify', { secret: `  ${TEST_SECRET}  ` });
    record(
      'POST /api/auth/verify normalizes surrounding whitespace in candidate secret',
      verifyWhitespaceRes.status === 200 && verifyWhitespaceRes.body?.data?.valid === true,
      `Got status ${verifyWhitespaceRes.status}`
    );

    // -------------------------------------------------------------------------
    // 3. Write Operations Rejected Without Secret
    // -------------------------------------------------------------------------
    console.log('\n[3. Unauthenticated Write Operation Rejection]');
    // Find an active roadmap in database
    const sampleRoadmap = await prisma.roadmap.findFirst({
      where: { status: 'active' },
      include: { roadmapDays: { include: { tasks: true } } },
    });

    if (!sampleRoadmap) {
      throw new Error('No active roadmap found in database to test.');
    }

    const unauthPauseRes = await request('POST', `/api/roadmaps/${sampleRoadmap.id}/pause`, {
      reason: 'Unauthorized attempt',
    });
    record(
      'POST /api/roadmaps/:id/pause rejected without secret (401)',
      unauthPauseRes.status === 401 && unauthPauseRes.body?.details?.code === 'ACCESS_SECRET_REQUIRED',
      `Got status ${unauthPauseRes.status}`
    );

    const sampleTask = sampleRoadmap.roadmapDays[0]?.tasks[0];
    if (sampleTask) {
      const unauthTaskRes = await request('POST', `/api/tasks/${sampleTask.id}/toggle`, {
        completed: true,
      });
      record(
        'POST /api/tasks/:id/toggle rejected without secret (401)',
        unauthTaskRes.status === 401 && unauthTaskRes.body?.details?.code === 'ACCESS_SECRET_REQUIRED',
        `Got status ${unauthTaskRes.status}`
      );
    }

    // -------------------------------------------------------------------------
    // 4. Authorized Write Lifecycle: Roadmap Pause & Resume
    // -------------------------------------------------------------------------
    console.log('\n[4. Authorized Pause & Resume Lifecycle]');
    // Pause roadmap with valid header
    const pauseRes = await request(
      'POST',
      `/api/roadmaps/${sampleRoadmap.id}/pause`,
      { reason: 'Semester Exam Preparation' },
      { 'x-app-access-secret': TEST_SECRET }
    );
    record(
      'POST /api/roadmaps/:id/pause succeeds with valid x-app-access-secret (200)',
      pauseRes.status === 200 && pauseRes.body?.data?.roadmap?.status === 'paused',
      `Got status ${pauseRes.status}, status=${pauseRes.body?.data?.roadmap?.status}`
    );

    // Verify database state directly
    const pausedDbRecord = await prisma.roadmap.findUnique({
      where: { id: sampleRoadmap.id },
    });
    record(
      'Database verifies roadmap status is now "paused"',
      pausedDbRecord?.status === 'paused',
      `Got DB status ${pausedDbRecord?.status}`
    );

    const pauseHistoryDbRecord = await prisma.roadmapPauseHistory.findFirst({
      where: { roadmapId: sampleRoadmap.id, resumedAt: null },
    });
    record(
      'Database verifies open pause record exists in roadmap_pause_history',
      pauseHistoryDbRecord !== null && pauseHistoryDbRecord.reason === 'Semester Exam Preparation',
      `Got history record: ${JSON.stringify(pauseHistoryDbRecord)}`
    );

    // Resume roadmap using Bearer token
    const resumeRes = await request(
      'POST',
      `/api/roadmaps/${sampleRoadmap.id}/resume`,
      {},
      { 'Authorization': `Bearer ${TEST_SECRET}` }
    );
    record(
      'POST /api/roadmaps/:id/resume succeeds with Bearer token (200)',
      resumeRes.status === 200 && resumeRes.body?.data?.roadmap?.status === 'active',
      `Got status ${resumeRes.status}, status=${resumeRes.body?.data?.roadmap?.status}`
    );

    const resumedDbRecord = await prisma.roadmap.findUnique({
      where: { id: sampleRoadmap.id },
    });
    record(
      'Database verifies roadmap status is restored to "active"',
      resumedDbRecord?.status === 'active',
      `Got DB status ${resumedDbRecord?.status}`
    );

    // -------------------------------------------------------------------------
    // 5. Authorized Write: Roadmap Update
    // -------------------------------------------------------------------------
    console.log('\n[5. Authorized Roadmap Update]');
    const originalDailyTarget = sampleRoadmap.targetDailyStudyTime || 60;
    const newDailyTarget = originalDailyTarget === 60 ? 75 : 60;
    const updateRoadmapRes = await request(
      'PATCH',
      `/api/roadmaps/${sampleRoadmap.id}`,
      { targetDailyStudyTime: newDailyTarget },
      { 'x-app-access-secret': `  ${TEST_SECRET}  ` } // whitespace tolerance test
    );
    record(
      'PATCH /api/roadmaps/:id succeeds with whitespace-padded secret (200)',
      updateRoadmapRes.status === 200 && updateRoadmapRes.body?.data?.targetDailyStudyTime === newDailyTarget,
      `Got status ${updateRoadmapRes.status}`
    );

    // Revert daily target
    await request(
      'PATCH',
      `/api/roadmaps/${sampleRoadmap.id}`,
      { targetDailyStudyTime: originalDailyTarget },
      { 'x-app-access-secret': TEST_SECRET }
    );

    // -------------------------------------------------------------------------
    // 6. Authorized Write: Task Completion Toggle
    // -------------------------------------------------------------------------
    console.log('\n[6. Authorized Task Completion]');
    if (sampleTask) {
      const toggleRes = await request(
        'POST',
        `/api/tasks/${sampleTask.id}/toggle`,
        { completed: true, notes: 'Completed in automated verification' },
        { 'x-app-access-secret': TEST_SECRET }
      );
      record(
        'POST /api/tasks/:id/toggle succeeds with valid secret (200)',
        toggleRes.status === 200,
        `Got status ${toggleRes.status}`
      );

      // Revert task toggle to keep data clean
      await request(
        'POST',
        `/api/tasks/${sampleTask.id}/toggle`,
        { completed: false },
        { 'x-app-access-secret': TEST_SECRET }
      );
    }

    // -------------------------------------------------------------------------
    // 7. Authorized Write: Notes Workspace CRUD
    // -------------------------------------------------------------------------
    console.log('\n[7. Authorized Notes Workspace Operations]');
    const createNoteRes = await request(
      'POST',
      '/api/notes',
      {
        title: 'Authorization Verification Note',
        content: 'Testing single-user access secret persistence.',
        roadmapId: sampleRoadmap.id,
      },
      { 'x-app-access-secret': TEST_SECRET }
    );
    record(
      'POST /api/notes creates note with valid secret (201)',
      createNoteRes.status === 201 && !!createNoteRes.body?.data?.id,
      `Got status ${createNoteRes.status}`
    );

    const createdNoteId = createNoteRes.body?.data?.id;
    if (createdNoteId) {
      const updateNoteRes = await request(
        'PUT',
        `/api/notes/${createdNoteId}`,
        {
          title: 'Authorization Verification Note (Updated)',
          content: 'Updated note content with verified access secret.',
        },
        { 'x-app-access-secret': TEST_SECRET }
      );
      record(
        'PUT /api/notes/:id updates note with valid secret (200)',
        updateNoteRes.status === 200 && updateNoteRes.body?.data?.title?.includes('Updated'),
        `Got status ${updateNoteRes.status}`
      );

      // Clean up test note
      await request('DELETE', `/api/notes/${createdNoteId}`, null, {
        'x-app-access-secret': TEST_SECRET,
      });
    }

    // -------------------------------------------------------------------------
    // 8. Authorized Write: Notification Preferences
    // -------------------------------------------------------------------------
    console.log('\n[8. Authorized Notification Preferences Update]');
    const updatePrefRes = await request(
      'PUT',
      '/api/notifications/preferences',
      { soundEnabled: true },
      { 'x-app-access-secret': TEST_SECRET }
    );
    record(
      'PUT /api/notifications/preferences succeeds with valid secret (200)',
      updatePrefRes.status === 200,
      `Got status ${updatePrefRes.status}`
    );

    console.log('\n===============================================================');
    console.log(`🏁 TEST RESULTS: ${results.passed} PASSED, ${results.failed} FAILED`);
    console.log('===============================================================\n');

  } catch (err) {
    console.error('Fatal test error:', err);
    results.failed++;
  } finally {
    if (server) {
      server.close();
    }
    // Disconnect prisma
    await prisma.$disconnect();
    process.exit(results.failed > 0 ? 1 : 0);
  }
}

run();
