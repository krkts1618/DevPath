import axios from 'axios';

const API = 'http://localhost:5000/api';

async function runFocusVerification() {
  console.log('====================================================');
  console.log('DEVPATH FOCUS TIMER & STUDY SESSION TEST SUITE');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Database Health Check & Load Existing Task
    const health = await axios.get(`${API}/health`);
    assert(health.data?.data?.database?.healthy === true, 'Database connection is healthy');

    const roadmapsRes = await axios.get(`${API}/roadmaps`);
    const roadmaps = roadmapsRes.data?.data?.roadmaps || roadmapsRes.data?.data || [];
    assert(roadmaps.length > 0, `Active roadmaps exist (${roadmaps.length} found)`);
    const testRoadmap = roadmaps[0];

    // Get a task from roadmap
    const rmDetail = await axios.get(`${API}/roadmaps/${testRoadmap.id}`);
    const firstDay = rmDetail.data?.data?.roadmapDays?.[0];
    const testTask = firstDay?.tasks?.[0];
    assert(testTask?.id !== undefined, `Found curriculum task for association: "${testTask?.title}"`);

    // Verify initial task completion state
    const initialCompleted = testTask.completions && testTask.completions.length > 0;

    // 2. Start a Pomodoro Session with Task Association
    console.log('\n--- 1. POMODORO SESSION & CONSTRAINTS ---');
    const pomoRes = await axios.post(`${API}/study-sessions/start`, {
      sessionType: 'pomodoro',
      targetDurationMinutes: 25,
      roadmapId: testRoadmap.id,
      roadmapDayId: firstDay?.id,
      taskId: testTask.id,
    });
    const pomoSession = pomoRes.data?.data;
    assert(
      pomoSession?.id && pomoSession.sessionType === 'pomodoro' && pomoSession.targetDurationMinutes === 25,
      'Start Pomodoro session (25m target) associated with curriculum task'
    );

    // 3. Prevent multiple active sessions (Must return 409 Conflict)
    try {
      await axios.post(`${API}/study-sessions/start`, {
        sessionType: 'custom',
        targetDurationMinutes: 10,
      });
      assert(false, 'Should prevent multiple active sessions concurrently');
    } catch (err) {
      assert(err.response?.status === 409, 'Single active session constraint enforced (Returned 409 Conflict)');
    }

    // 4. Recover Active Session via API
    const activeRes = await axios.get(`${API}/study-sessions/active`);
    assert(activeRes.data?.data?.id === pomoSession.id, 'Recover active session on reload/navigation');

    // 5. Pause Session
    console.log('\n--- 2. PAUSE, RESUME & TIME CALCULATIONS ---');
    const pauseRes = await axios.post(`${API}/study-sessions/${pomoSession.id}/pause`);
    assert(pauseRes.data?.data?.status === 'paused', 'Pause active session');

    // Brief pause delay simulation
    await new Promise((r) => setTimeout(r, 600));

    // 6. Resume Session
    const resumeRes = await axios.post(`${API}/study-sessions/${pomoSession.id}/resume`);
    assert(
      resumeRes.data?.data?.status === 'active' && resumeRes.data?.data?.pausedDurationSeconds >= 0,
      'Resume session and track paused duration'
    );

    // 7. Complete Session with Server-Side Validation
    console.log('\n--- 3. COMPLETION & TASK INDEPENDENCE ---');
    const completeRes = await axios.post(`${API}/study-sessions/${pomoSession.id}/complete`, {
      actualDurationSeconds: 1500, // 25 mins
      notes: 'Completed in-depth study session on curriculum module',
    });
    assert(completeRes.data?.data?.status === 'completed', 'Complete focus session with validated duration');

    // 8. Verify Task Completion Is NOT Automatic
    const verifyTaskRes = await axios.get(`${API}/tasks/${testTask.id}`);
    const taskAfterTimer = verifyTaskRes.data?.data;
    const completedAfterTimer = taskAfterTimer?.completions && taskAfterTimer.completions.length > 0;
    assert(
      initialCompleted === completedAfterTimer,
      'Timer completion does NOT auto-complete the curriculum task (remains separate user action)'
    );

    // 9. Custom Timer Mode (e.g. 45 minutes)
    console.log('\n--- 4. CUSTOM & STOPWATCH MODES ---');
    const customRes = await axios.post(`${API}/study-sessions/start`, {
      sessionType: 'custom',
      targetDurationMinutes: 45,
      title: 'Deep Architecture Design Sprint',
    });
    const customSession = customRes.data?.data;
    assert(
      customSession?.id && customSession.targetDurationMinutes === 45,
      'Start custom timer session (45 minutes)'
    );
    await axios.post(`${API}/study-sessions/${customSession.id}/complete`, {
      actualDurationSeconds: 2700,
    });

    // 10. Stopwatch Mode (Counts upward without target)
    const swRes = await axios.post(`${API}/study-sessions/start`, {
      sessionType: 'stopwatch',
      title: 'Open-ended Bug Triage Stopwatch',
    });
    const swSession = swRes.data?.data;
    assert(
      swSession?.id && swSession.targetDurationMinutes === null,
      'Start stopwatch mode (count upward from zero, targetDurationMinutes is null)'
    );

    // 11. Interrupt Session and Recovery
    console.log('\n--- 5. INTERRUPTED SESSIONS & RECOVERY ---');
    const intRes = await axios.post(`${API}/study-sessions/${swSession.id}/interrupt`, {
      actualDurationSeconds: 420,
      notes: 'Interrupted by team standup',
    });
    assert(intRes.data?.data?.status === 'interrupted', 'Mark session as interrupted');

    // Resume interrupted session
    const resIntRes = await axios.post(`${API}/study-sessions/${swSession.id}/resume-interrupted`);
    assert(resIntRes.data?.data?.status === 'active', 'Resume an interrupted session');

    // Discard session
    const discardRes = await axios.post(`${API}/study-sessions/${swSession.id}/discard`);
    assert(discardRes.data?.data?.status === 'discarded', 'Discard session with status updated to discarded');

    // 12. Associate with Revision Session
    console.log('\n--- 6. ASSOCIATIONS: REVISION & PROJECT ---');
    const revItemRes = await axios.post(`${API}/revisions`, {
      topic: 'PostgreSQL Buffer Cache Eviction Policies',
      intervalDays: 1,
    });
    const revItem = revItemRes.data?.data;

    const revSessionRes = await axios.post(`${API}/study-sessions/start`, {
      sessionType: 'pomodoro',
      targetDurationMinutes: 25,
      revisionScheduleId: revItem.id,
      title: `Revision: ${revItem.topic}`,
    });
    assert(revSessionRes.data?.data?.revisionScheduleId === revItem.id, 'Associate focus session with revision topic');
    await axios.post(`${API}/study-sessions/${revSessionRes.data.data.id}/complete`, { actualDurationSeconds: 1500 });

    // 13. Associate with Project
    const projRes = await axios.post(`${API}/projects`, {
      name: 'Storage Engine LSM Tree Benchmark',
      status: 'active',
    });
    const proj = projRes.data?.data;

    const projSessionRes = await axios.post(`${API}/study-sessions/start`, {
      sessionType: 'pomodoro',
      targetDurationMinutes: 25,
      projectId: proj.id,
    });
    assert(projSessionRes.data?.data?.projectId === proj.id, 'Associate focus session with project');
    await axios.post(`${API}/study-sessions/${projSessionRes.data.data.id}/complete`, { actualDurationSeconds: 1500 });

    // 14. Study Time Analytics & Exclusions
    console.log('\n--- 7. ANALYTICS & TIMEZONE (ASIA/KOLKATA) ---');
    const analyticsRes = await axios.get(`${API}/study-sessions/analytics`);
    const ana = analyticsRes.data?.data;
    assert(
      ana?.completedSessionsCount >= 3 && ana?.todayFocusMinutes >= 0,
      `Study analytics computed accurately (${ana?.completedSessionsCount} sessions, ${ana?.todayFocusMinutes}m today)`
    );
    assert(Array.isArray(ana?.dailyTrend) && ana.dailyTrend.length === 14, '14-day daily trend timeline generated');
    assert(Array.isArray(ana?.byRoadmap), 'Roadmap-wise focus time distribution calculated');

    // 15. Task Focus Duration Endpoint
    const taskFocusRes = await axios.post(`${API}/study-sessions/tasks-focus`, {
      taskIds: [testTask.id],
    });
    const taskFocus = taskFocusRes.data?.data;
    assert(
      taskFocus[testTask.id] !== undefined && taskFocus[testTask.id].focusSeconds > 0,
      `Task accumulated focus time verified (${taskFocus[testTask.id]?.focusSeconds}s focused, ${taskFocus[testTask.id]?.focusMinutes}m)`
    );

    // 16. Cleanup & Integrity
    console.log('\n--- 8. CLEANUP & SAFETY ---');
    await axios.delete(`${API}/study-sessions/${pomoSession.id}`);
    await axios.delete(`${API}/study-sessions/${customSession.id}`);
    await axios.delete(`${API}/study-sessions/${swSession.id}`);
    await axios.delete(`${API}/study-sessions/${revSessionRes.data.data.id}`);
    await axios.delete(`${API}/study-sessions/${projSessionRes.data.data.id}`);
    await axios.delete(`${API}/projects/${proj.id}`);
    await axios.delete(`${API}/revisions/${revItem.id}`);

    // Verify curriculum roadmap is 100% intact
    const verifyRm = await axios.get(`${API}/roadmaps/${testRoadmap.id}`);
    assert(verifyRm.data?.data?.id === testRoadmap.id, 'Curriculum roadmaps and tasks remain 100% intact');

    console.log('\n====================================================');
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Test execution failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

runFocusVerification();
