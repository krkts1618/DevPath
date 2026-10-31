const BASE = 'http://localhost:5000/api';

async function req(method, endpoint, body = null) {
  const url = `${BASE}${endpoint}`;
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const json = await res.json().catch(() => ({}));
  // Brief pause to allow pooler socket reuse
  await new Promise((r) => setTimeout(r, 60));
  return { status: res.status, ok: res.ok, data: json };
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`  ✓ ${message}`);
}

async function runAdaptiveEngineTests() {
  console.log('🧪 Starting DevPath Adaptive Progression Engine & Streak Tests (10 Scenarios)...\n');

  // Verify backend health first
  const healthCheck = await req('GET', '/health');
  assert(
    healthCheck.ok && healthCheck.data?.data?.status === 'UP',
    'Backend API is up and healthy'
  );

  // Fetch target roadmaps via API
  const listRes = await req('GET', '/roadmaps');
  assert(listRes.ok && Array.isArray(listRes.data?.data), 'Roadmaps list fetched successfully');
  const allRoadmaps = listRes.data.data;

  const sbStub = allRoadmaps.find((r) => r.slug === 'java-spring-boot');
  const mernStub = allRoadmaps.find((r) => r.slug === 'mern-stack-maintenance');
  const gitStub = allRoadmaps.find((r) => r.slug === 'git-github-docker');

  assert(sbStub && mernStub && gitStub, 'Found Spring Boot, MERN, and GitHub roadmaps');

  const [sbFull, mernFull, gitFull] = await Promise.all([
    req('GET', `/roadmaps/${sbStub.id}`),
    req('GET', `/roadmaps/${mernStub.id}`),
    req('GET', `/roadmaps/${gitStub.id}`),
  ]);

  const springBoot = sbFull.data.data;
  const mern = mernFull.data.data;
  const github = gitFull.data.data;

  const completedTaskIds = new Set();

  try {
    console.log('\n--- SCENARIO 1: Spring Boot Day 2 complete, MERN Day 2 complete, GitHub Day 2 incomplete ---');
    // Complete all tasks for Spring Boot Day 1 & Day 2
    for (const day of springBoot.roadmapDays.filter((d) => d.dayNumber <= 2)) {
      for (const task of day.tasks) {
        await req('POST', `/tasks/${task.id}/complete`, { completed: true });
        completedTaskIds.add(task.id);
      }
    }

    // Complete all tasks for MERN Day 1 & Day 2
    for (const day of mern.roadmapDays.filter((d) => d.dayNumber <= 2)) {
      for (const task of day.tasks) {
        await req('POST', `/tasks/${task.id}/complete`, { completed: true });
        completedTaskIds.add(task.id);
      }
    }

    // Complete Day 1 for GitHub, but leave Day 2 incomplete (complete only 1 task, leave rest pending)
    const gitDay1 = github.roadmapDays.find((d) => d.dayNumber === 1);
    const gitDay2 = github.roadmapDays.find((d) => d.dayNumber === 2);
    for (const task of gitDay1.tasks) {
      await req('POST', `/tasks/${task.id}/complete`, { completed: true });
      completedTaskIds.add(task.id);
    }
    // Complete only 1 task of Git Day 2
    const gitDay2FirstTask = gitDay2.tasks[0];
    await req('POST', `/tasks/${gitDay2FirstTask.id}/complete`, { completed: true });
    completedTaskIds.add(gitDay2FirstTask.id);

    // Verify progression via API
    const sbProg = (await req('GET', `/roadmaps/${springBoot.id}`)).data.data;
    const mernProg = (await req('GET', `/roadmaps/${mern.id}`)).data.data;
    const gitProg = (await req('GET', `/roadmaps/${github.id}`)).data.data;

    assert(sbProg.currentLearningDayNumber === 3, 'TEST 1: Spring Boot independently advanced to Day 3');
    assert(mernProg.currentLearningDayNumber === 3, 'TEST 1: MERN independently advanced to Day 3');
    assert(gitProg.currentLearningDayNumber === 2, 'TEST 1: GitHub remains on Day 2 due to pending tasks');

    const gitActiveDay = gitProg.roadmapDays.find((d) => d.dayNumber === 2);
    assert(
      gitActiveDay.pendingTasksCount === gitDay2.tasks.length - 1,
      'TEST 1: GitHub shows only remaining Day 2 tasks, not Day 3'
    );

    console.log('\n--- SCENARIO 2: Complete final pending GitHub Day 2 tasks ---');
    for (let i = 1; i < gitDay2.tasks.length; i++) {
      const task = gitDay2.tasks[i];
      await req('POST', `/tasks/${task.id}/complete`, { completed: true });
      completedTaskIds.add(task.id);
    }

    const gitProgAfter = (await req('GET', `/roadmaps/${github.id}`)).data.data;
    const sbProgAfter = (await req('GET', `/roadmaps/${springBoot.id}`)).data.data;
    const mernProgAfter = (await req('GET', `/roadmaps/${mern.id}`)).data.data;

    assert(gitProgAfter.currentLearningDayNumber === 3, 'TEST 2: GitHub advanced to Day 3 after Day 2 completion');
    assert(sbProgAfter.currentLearningDayNumber === 3, 'TEST 2: Spring Boot remained at Day 3');
    assert(mernProgAfter.currentLearningDayNumber === 3, 'TEST 2: MERN remained at Day 3');

    console.log('\n--- SCENARIO 3 & 4: Daily Streak 5-Task Rule (3/5 vs 5/5) ---');
    // Clear all completions for today to test cleanly
    for (const taskId of completedTaskIds) {
      await req('POST', `/tasks/${taskId}/complete`, { completed: false });
    }
    completedTaskIds.clear();

    // Complete exactly 3 distinct tasks today
    const sampleTasks = [gitDay1.tasks[0].id, gitDay1.tasks[1].id, gitDay1.tasks[2].id];
    for (const taskId of sampleTasks) {
      await req('POST', `/tasks/${taskId}/complete`, { completed: true });
      completedTaskIds.add(taskId);
    }

    let streakRes = await req('GET', '/dashboard/stats');
    let streakData = streakRes.data?.data;
    assert(streakData && streakData.completedToday === 3, 'TEST 3: Today shows exactly 3 completed tasks');
    assert(streakData.qualifiedToday === false, 'TEST 3: Today does not yet qualify for streak (3 < 5)');
    assert(streakData.remainingToday === 2, 'TEST 3: Indicates 2 more tasks required to qualify');

    // Complete 2 more distinct tasks today (total 5)
    const sampleTasks2 = [gitDay2.tasks[0].id, gitDay2.tasks[1].id];
    for (const taskId of sampleTasks2) {
      await req('POST', `/tasks/${taskId}/complete`, { completed: true });
      completedTaskIds.add(taskId);
    }

    streakRes = await req('GET', '/dashboard/stats');
    streakData = streakRes.data?.data;
    assert(streakData && streakData.completedToday === 5, 'TEST 4: Today shows exactly 5 completed tasks');
    assert(streakData.qualifiedToday === true, 'TEST 4: Today qualifies for daily streak (5 >= 5)');
    assert(streakData.currentStreak >= 1, 'TEST 4: Current streak is at least 1');
    assert(streakData.remainingToday === 0, 'TEST 4: Remaining tasks today is 0');

    console.log('\n--- SCENARIO 5: Duplicate completion idempotency ---');
    // Try completing the same task again
    const resDup = await req('POST', `/tasks/${gitDay1.tasks[0].id}/complete`, { completed: true });
    assert(resDup.ok, 'Completion request succeeds');
    const taskDetails = await req('GET', `/tasks/${gitDay1.tasks[0].id}`);
    assert(
      taskDetails.ok && taskDetails.data?.data?.completions?.length === 1,
      'TEST 5: Exactly 1 completion record exists, no duplicates created'
    );

    console.log('\n--- SCENARIO 6: Independent progression integrity ---');
    const gitProgBefore = (await req('GET', `/roadmaps/${github.id}`)).data.data;
    // Complete 1 task on Spring Boot Day 1
    const sbTask = springBoot.roadmapDays[0].tasks[0];
    await req('POST', `/tasks/${sbTask.id}/complete`, { completed: true });
    completedTaskIds.add(sbTask.id);

    const gitProgCheck = (await req('GET', `/roadmaps/${github.id}`)).data.data;
    const sbProgCheck = (await req('GET', `/roadmaps/${springBoot.id}`)).data.data;
    assert(
      gitProgCheck.currentLearningDayNumber === gitProgBefore.currentLearningDayNumber,
      'TEST 6: GitHub unaffected by Spring Boot completion'
    );
    assert(sbProgCheck.currentLearningDayNumber === 1, 'TEST 6: Spring Boot Day 1 still has pending tasks so stays on Day 1');

    console.log('\n--- SCENARIO 7: Carry-forward incomplete task in active queue ---');
    const queueRes = await req('GET', '/dashboard/planner');
    const activeSb = queueRes.data.data.roadmapsQueue.find((r) => r.roadmapId === springBoot.id);
    assert(activeSb !== undefined, 'TEST 7: Spring Boot is in active learning queue');
    assert(activeSb.currentDayNumber === 1, 'TEST 7: Spring Boot carries forward incomplete Day 1');
    assert(activeSb.activeTasks.length === springBoot.roadmapDays[0].tasks.length - 1, 'TEST 7: Carries forward only remaining incomplete tasks');

    console.log('\n--- SCENARIO 8: Reschedule incomplete task preserving roadmap relationship ---');
    const taskToReschedule = springBoot.roadmapDays[0].tasks[1];
    const reschedRes = await req('POST', `/tasks/${taskToReschedule.id}/reschedule`, {
      targetDate: '2026-11-05',
      reason: 'Interview preparation carryover',
    });
    assert(reschedRes.ok, 'TEST 8: Successfully rescheduled task');

    const history = await req('GET', `/tasks/${taskToReschedule.id}/history`);
    assert(history.data.data.reassignments.length >= 1, 'TEST 8: Reassignment logged in audit history');

    // Revert reschedule
    const revertRes = await req('DELETE', `/tasks/${taskToReschedule.id}/reassign`);
    assert(revertRes.ok, 'TEST 8: Revert reschedule endpoint succeeded');
    const historyAfterRevert = await req('GET', `/tasks/${taskToReschedule.id}/history`);
    assert(historyAfterRevert.data.data.reassignments.length === 0, 'TEST 8: Reassignment reverted cleanly');

    console.log('\n--- SCENARIO 9: Reload / persisted state validation ---');
    const finalStats = await req('GET', '/dashboard/stats');
    assert(finalStats.ok && finalStats.data.data.totalRoadmapsCount === 10, 'TEST 9: State correctly derived from database');

    console.log('\n--- SCENARIO 10: Health telemetry & timezone integrity ---');
    const healthRes = await req('GET', '/health');
    assert(
      healthRes.ok && healthRes.data.data?.status === 'UP' && healthRes.data.data?.database?.healthy === true,
      'TEST 10: Backend and Supabase PostgreSQL healthy with active connection'
    );
    assert(healthRes.data.data.database.database === 'postgres', 'TEST 10: Connected to PostgreSQL database');

    console.log('\n🎉 ALL 10 ADAPTIVE LEARNING ENGINE AND STREAK TEST SCENARIOS PASSED!\n');
  } finally {
    console.log('Cleaning up test completion records via API...');
    for (const id of completedTaskIds) {
      await req('POST', `/tasks/${id}/complete`, { completed: false });
    }
    console.log('Database restored to clean state.');
  }
}

runAdaptiveEngineTests().catch((err) => {
  console.error('\n💥 Test run failed:', err);
  process.exit(1);
});
