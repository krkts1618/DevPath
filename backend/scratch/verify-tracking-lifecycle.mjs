import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('DEVPATH: COMPREHENSIVE TRACKING & LIFECYCLE TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const healthRes = await axios.get(`${API_BASE}/health`);
    assert(healthRes.data?.success && healthRes.data?.data?.status === 'UP', 'Scenario 0: Backend and Supabase DB Health');

    // 2. Fetch overall streak
    const streakRes = await axios.get(`${API_BASE}/analytics/streak`);
    const streakData = streakRes.data?.data;
    assert(typeof streakData?.currentStreak === 'number', 'Scenario 1: Overall streak calculates numeric currentStreak');
    assert(typeof streakData?.bestStreak === 'number', 'Scenario 1b: Overall streak calculates numeric bestStreak');
    assert(typeof streakData?.completedToday === 'number', 'Scenario 1c: Overall streak calculates completedToday');
    assert(streakData?.streakTarget >= 1, `Scenario 1d: Streak target is active (current: ${streakData?.streakTarget})`);

    // 3. Roadmap-specific streak
    const roadmapsRes = await axios.get(`${API_BASE}/roadmaps?limit=1`);
    const testRoadmap = roadmapsRes.data?.data?.[0];
    assert(testRoadmap?.id, 'Scenario 2: Active roadmap found for roadmap-specific testing');

    if (testRoadmap) {
      const rmStreakRes = await axios.get(`${API_BASE}/analytics/roadmaps/${testRoadmap.id}/streak`);
      const rmStreak = rmStreakRes.data?.data;
      assert(typeof rmStreak?.currentStreak === 'number' && typeof rmStreak?.bestStreak === 'number',
        `Scenario 2b: Roadmap-specific streak isolated for "${testRoadmap.title}"`);
    }

    // 4. Activity heatmap
    const heatmapRes = await axios.get(`${API_BASE}/analytics/heatmap?months=12`);
    const heatmapData = heatmapRes.data?.data;
    assert(Array.isArray(heatmapData?.days) && heatmapData.days.length >= 350,
      `Scenario 3: 12-month activity heatmap returns ${heatmapData?.days?.length} contiguous calendar days`);
    assert(typeof heatmapData?.summary?.totalActiveDays === 'number',
      `Scenario 3b: Heatmap summary computed (totalActiveDays: ${heatmapData?.summary?.totalActiveDays})`);

    // 5. Daily Progress Summary
    const summaryRes = await axios.get(`${API_BASE}/analytics/summary`);
    const summary = summaryRes.data?.data;
    assert(summary?.date && typeof summary.completed === 'number',
      `Scenario 4: Daily progress summary for ${summary?.date} (completed: ${summary?.completed}, scheduled: ${summary?.scheduled})`);

    // 6. Learning History with pagination
    const historyRes = await axios.get(`${API_BASE}/analytics/history?page=1&limit=10`);
    const history = historyRes.data?.data;
    assert(Array.isArray(history?.records) && typeof history.totalCount === 'number',
      `Scenario 5: Learning history paginated (records: ${history?.records?.length}, total: ${history?.totalCount})`);

    // 7. Configurable Streak Target API
    const targetGetRes = await axios.get(`${API_BASE}/analytics/streak-target`);
    assert(targetGetRes.data?.data?.currentTarget !== undefined,
      `Scenario 6: Streak target configuration retrieved (current: ${targetGetRes.data?.data?.currentTarget})`);

    // 8. Planned Rest Days Management
    const testRestDate = '2099-01-01';
    const setRestRes = await axios.post(`${API_BASE}/calendar/rest-days`, {
      date: testRestDate,
      title: 'Automated Test Rest Day',
      reason: 'Testing neutral day rules',
    });
    assert(setRestRes.data?.success && setRestRes.data?.data?.date === testRestDate,
      'Scenario 7: Planned rest day created successfully');

    const restDaysListRes = await axios.get(`${API_BASE}/calendar/rest-days?start=2099-01-01&end=2099-01-01`);
    assert(restDaysListRes.data?.data?.length === 1, 'Scenario 7b: Planned rest day queried from database');

    const delRestRes = await axios.delete(`${API_BASE}/calendar/rest-days/${testRestDate}`);
    assert(delRestRes.data?.success, 'Scenario 7c: Planned rest day cleaned up');

    // 9. Manual Personal Tasks Lifecycle
    const personalTaskRes = await axios.post(`${API_BASE}/personal-tasks`, {
      title: 'Automated Verification Personal Task',
      description: 'Verifying streak and calendar integration',
      scheduledDate: '2099-01-01',
      priority: 'high',
      estimatedDuration: 45,
    });
    const createdPersonal = personalTaskRes.data?.data;
    assert(createdPersonal?.id && createdPersonal.priority === 'high',
      'Scenario 8: Manual personal task created with priority High');

    const togglePersonalRes = await axios.patch(`${API_BASE}/personal-tasks/${createdPersonal.id}/toggle`);
    assert(togglePersonalRes.data?.data?.completed === true,
      'Scenario 8b: Personal task completion toggled to completed');

    const delPersonalRes = await axios.delete(`${API_BASE}/personal-tasks/${createdPersonal.id}`);
    assert(delPersonalRes.data?.success, 'Scenario 8c: Personal task cleaned up');

    // 10. Task Priority Update
    if (history?.records?.[0]?.taskId) {
      const taskId = history.records[0].taskId;
      const priorityRes = await axios.patch(`${API_BASE}/tasks/${taskId}/priority`, { priority: 'urgent' });
      assert(priorityRes.data?.data?.priority === 'urgent',
        `Scenario 9: Roadmap task priority updated to urgent`);
      // Restore to normal
      await axios.patch(`${API_BASE}/tasks/${taskId}/priority`, { priority: 'normal' });
    } else {
      console.log('Skipping priority on existing task (no completions yet)');
    }

    // 11. Roadmap Pause & Resume Lifecycle
    if (testRoadmap) {
      const pauseRes = await axios.post(`${API_BASE}/roadmaps/${testRoadmap.id}/pause`, {
        reason: 'Verification test pause',
      });
      assert(pauseRes.data?.data?.roadmap?.status === 'paused',
        `Scenario 10: Roadmap "${testRoadmap.title}" paused successfully`);

      // Verify paused roadmap is omitted from active queue
      const queueRes = await axios.get(`${API_BASE}/dashboard/queue`);
      const inQueue = queueRes.data?.data?.roadmaps?.some(r => r.roadmapId === testRoadmap.id);
      assert(!inQueue, 'Scenario 11: Paused roadmap successfully excluded from active learning queue');

      // Check pause history
      const histRes = await axios.get(`${API_BASE}/roadmaps/${testRoadmap.id}/pause-history`);
      assert(histRes.data?.data?.length > 0, 'Scenario 12: Roadmap pause history recorded in database');

      // Resume roadmap
      const resumeRes = await axios.post(`${API_BASE}/roadmaps/${testRoadmap.id}/resume`);
      assert(resumeRes.data?.data?.roadmap?.status === 'active',
        `Scenario 13: Roadmap "${testRoadmap.title}" resumed successfully`);

      const queueRes2 = await axios.get(`${API_BASE}/dashboard/queue`);
      const inQueue2 = queueRes2.data?.data?.roadmaps?.some(r => r.roadmapId === testRoadmap.id);
      assert(inQueue2, 'Scenario 13b: Resumed roadmap returned to active learning queue');
    }

    // 12. Calendar events aggregation
    const calEventsRes = await axios.get(`${API_BASE}/calendar/events`);
    assert(calEventsRes.data?.data?.eventsByDate !== undefined,
      'Scenario 14: Comprehensive learning calendar events aggregated across tracks');

  } catch (err) {
    console.error('Test execution error:', err.response?.data || err.message);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
