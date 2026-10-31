import app from '../src/app.js';
import { prisma, checkDatabaseHealth } from '../src/config/db.js';

let server;
let baseUrl;

const results = {
  passed: 0,
  failed: 0,
  tests: [],
};

function recordTest(name, passed, details = '') {
  results.tests.push({ name, passed, details });
  if (passed) {
    results.passed++;
    console.log(`  ✅ PASS: ${name}`);
  } else {
    results.failed++;
    console.error(`  ❌ FAIL: ${name} -> ${details}`);
  }
}

async function request(method, path, body = null) {
  const url = `${baseUrl}${path}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const res = await fetch(url, options);
  const json = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, body: json };
}

async function runTestSuite() {
  console.log('🧪 Starting DevPath Full Backend & Database Test Suite...\n');

  // Start temporary HTTP test server on random port
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`📡 Test Server listening on ${baseUrl}\n`);
      resolve();
    });
  });

  try {
    // 1. Database Connection Test
    console.log('[Suite 1: Database & Health]');
    const dbHealth = await checkDatabaseHealth();
    recordTest(
      'Database Connection (Supabase PostgreSQL)',
      dbHealth.healthy === true,
      dbHealth.error || `Connected in ${dbHealth.latencyMs}ms`
    );

    // 2. Health Endpoint Test
    const healthRes = await request('GET', '/api/health');
    recordTest(
      'Health Endpoint (GET /api/health)',
      healthRes.status === 200 && healthRes.body?.data?.status === 'UP',
      `Status: ${healthRes.status}`
    );

    // 3. Category Creation
    console.log('\n[Suite 2: Category Lifecycle]');
    const testCatSlug = `test-cat-${Date.now()}`;
    const createCatRes = await request('POST', '/api/categories', {
      name: `Test Category ${Date.now()}`,
      slug: testCatSlug,
      description: 'Temporary category for automated test suite',
      displayOrder: 99,
    });
    const createdCatId = createCatRes.body?.data?.id;
    recordTest(
      'Category Creation (POST /api/categories)',
      createCatRes.status === 201 && !!createdCatId,
      `Created ID: ${createdCatId}`
    );

    // Category Retrieval
    const getCatRes = await request('GET', `/api/categories/${createdCatId}`);
    recordTest(
      'Category Retrieval (GET /api/categories/:id)',
      getCatRes.status === 200 && getCatRes.body?.data?.slug === testCatSlug,
      `Retrieved slug: ${getCatRes.body?.data?.slug}`
    );

    // 4. Roadmap Creation
    console.log('\n[Suite 3: Roadmap Lifecycle]');
    const testRmSlug = `test-roadmap-${Date.now()}`;
    const createRmRes = await request('POST', '/api/roadmaps', {
      categoryId: createdCatId,
      title: 'Automated Test Roadmap',
      slug: testRmSlug,
      duration: 10,
      targetDailyStudyTime: 60,
      startDate: new Date().toISOString(),
      iconIdentifier: 'code',
      themeIdentifier: 'blue',
    });
    const createdRmId = createRmRes.body?.data?.id;
    recordTest(
      'Roadmap Creation (POST /api/roadmaps)',
      createRmRes.status === 201 && !!createdRmId,
      `Created ID: ${createdRmId}`
    );

    // Roadmap Retrieval
    const getRmRes = await request('GET', `/api/roadmaps/${createdRmId}`);
    recordTest(
      'Roadmap Retrieval (GET /api/roadmaps/:id)',
      getRmRes.status === 200 && getRmRes.body?.data?.title === 'Automated Test Roadmap',
      `Title: ${getRmRes.body?.data?.title}`
    );

    // Roadmap Update
    const updateRmRes = await request('PATCH', `/api/roadmaps/${createdRmId}`, {
      title: 'Updated Test Roadmap Title',
      targetDailyStudyTime: 90,
    });
    recordTest(
      'Roadmap Update (PATCH /api/roadmaps/:id)',
      updateRmRes.status === 200 && updateRmRes.body?.data?.title === 'Updated Test Roadmap Title',
      `Updated title: ${updateRmRes.body?.data?.title}`
    );

    // Roadmap Archive (Default Delete)
    const archiveRmRes = await request('DELETE', `/api/roadmaps/${createdRmId}`);
    recordTest(
      'Roadmap Archive (DELETE /api/roadmaps/:id)',
      archiveRmRes.status === 200 && archiveRmRes.body?.data?.status === 'archived',
      `Status: ${archiveRmRes.body?.data?.status}`
    );

    // Roadmap Restore
    const restoreRmRes = await request('POST', `/api/roadmaps/${createdRmId}/restore`);
    recordTest(
      'Roadmap Restore (POST /api/roadmaps/:id/restore)',
      restoreRmRes.status === 200 && restoreRmRes.body?.data?.status === 'active',
      `Restored status: ${restoreRmRes.body?.data?.status}`
    );

    // 5. Category Deletion Protection (Cannot delete category containing roadmaps without cascade)
    console.log('\n[Suite 4: Relationship & Cascade Protection]');
    const deleteCatFailRes = await request('DELETE', `/api/categories/${createdCatId}`);
    recordTest(
      'Category Relationship Protection (Cannot delete category with roadmaps)',
      deleteCatFailRes.status === 400 && deleteCatFailRes.body?.success === false,
      deleteCatFailRes.body?.message
    );

    // 6. Module Creation & Range Validation
    console.log('\n[Suite 5: Module Architecture & Day Range Validation]');
    // Invalid Module Range (startingDay > endingDay)
    const invalidModRes1 = await request('POST', `/api/roadmaps/${createdRmId}/modules`, {
      title: 'Invalid Range Module',
      startingDay: 5,
      endingDay: 2,
    });
    recordTest(
      'Invalid Module Range Prevention (startingDay > endingDay)',
      invalidModRes1.status === 422 || invalidModRes1.status === 400,
      `Status: ${invalidModRes1.status}`
    );

    // Invalid Module Range (endingDay > roadmap duration)
    const invalidModRes2 = await request('POST', `/api/roadmaps/${createdRmId}/modules`, {
      title: 'Exceeding Duration Module',
      startingDay: 1,
      endingDay: 25, // roadmap duration is 10
    });
    recordTest(
      'Invalid Module Range Prevention (endingDay > duration)',
      invalidModRes2.status === 400 && invalidModRes2.body?.success === false,
      invalidModRes2.body?.message
    );

    // Valid Module Creation
    const createModRes = await request('POST', `/api/roadmaps/${createdRmId}/modules`, {
      title: 'Test Module 1',
      description: 'Valid test module',
      startingDay: 1,
      endingDay: 5,
      displayOrder: 1,
    });
    const createdModId = createModRes.body?.data?.id;
    recordTest(
      'Module Creation (POST /api/roadmaps/:id/modules)',
      createModRes.status === 201 && !!createdModId,
      `Module ID: ${createdModId}`
    );

    // 7. Day Creation & Duplicate Day Prevention
    console.log('\n[Suite 6: Day Creation & Unique Constraints]');
    const createDayRes = await request('POST', `/api/roadmaps/${createdRmId}/days`, {
      moduleId: createdModId,
      dayNumber: 1,
      title: 'Day 1 Test Title',
      objective: 'Day 1 Test Objective',
      dayType: 'learning',
      estimatedStudyTime: 60,
    });
    const createdDayId = createDayRes.body?.data?.id;
    recordTest(
      'Day Creation (POST /api/roadmaps/:id/days)',
      createDayRes.status === 201 && !!createdDayId,
      `Day ID: ${createdDayId}`
    );

    // Duplicate Day Prevention
    const dupDayRes = await request('POST', `/api/roadmaps/${createdRmId}/days`, {
      dayNumber: 1,
      title: 'Duplicate Day Number 1',
    });
    recordTest(
      'Duplicate Day Prevention (Unique dayNumber per roadmap)',
      dupDayRes.status === 409 && dupDayRes.body?.success === false,
      dupDayRes.body?.message
    );

    // 8. Task Creation, Completion & Reassignment
    console.log('\n[Suite 7: Task Lifecycle & Completion]');
    const createTaskRes = await request('POST', `/api/days/${createdDayId}/tasks`, {
      title: 'Test Independent Task',
      description: 'Testing task completion and reassignment mechanics',
      taskType: 'code',
      estimatedDuration: 30,
    });
    const createdTaskId = createTaskRes.body?.data?.id;
    recordTest(
      'Task Creation (POST /api/days/:id/tasks)',
      createTaskRes.status === 201 && !!createdTaskId,
      `Task ID: ${createdTaskId}`
    );

    // Toggle Task Completion Checkbox
    const completeTaskRes = await request('POST', `/api/tasks/${createdTaskId}/complete`, {
      completed: true,
      notes: 'Completed in automated test',
    });
    recordTest(
      'Task Completion Checkbox Toggle (POST /api/tasks/:id/complete)',
      completeTaskRes.status === 200 && completeTaskRes.body?.data?.completed === true,
      `Completed status: ${completeTaskRes.body?.data?.completed}`
    );

    // Uncheck Task Checkbox
    const uncheckTaskRes = await request('POST', `/api/tasks/${createdTaskId}/complete`, {
      completed: false,
    });
    recordTest(
      'Task Uncheck Toggle (POST /api/tasks/:id/complete -> false)',
      uncheckTaskRes.status === 200 && uncheckTaskRes.body?.data?.completed === false,
      `Completed status: ${uncheckTaskRes.body?.data?.completed}`
    );

    // 9. Cleanup Test Data Transactionally
    console.log('\n[Suite 8: Permanent Deletion & Cleanup]');
    // Permanent Roadmap Delete with confirm=true
    const permDeleteRmRes = await request(
      'DELETE',
      `/api/roadmaps/${createdRmId}?permanent=true&confirm=true`
    );
    recordTest(
      'Permanent Roadmap Deletion (DELETE /api/roadmaps/:id?permanent=true&confirm=true)',
      permDeleteRmRes.status === 200,
      permDeleteRmRes.body?.message
    );

    // Now category can be deleted safely
    const deleteCatRes = await request('DELETE', `/api/categories/${createdCatId}`);
    recordTest(
      'Category Deletion after Roadmap Removal (DELETE /api/categories/:id)',
      deleteCatRes.status === 200,
      deleteCatRes.body?.message
    );

  } catch (error) {
    console.error('Unhandled Test Exception:', error);
    recordTest('Test Suite Exception', false, error.message);
  } finally {
    if (server) {
      server.close();
    }
    await prisma.$disconnect();
  }

  console.log('\n==================================================');
  console.log(`🏁 TEST RESULTS: ${results.passed} PASSED, ${results.failed} FAILED`);
  console.log('==================================================\n');

  if (results.failed > 0) {
    process.exit(1);
  }
}

runTestSuite();
