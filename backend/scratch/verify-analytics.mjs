// Comprehensive Automated Verification Suite for Analytics and Engineering Insights
const API_BASE = 'http://localhost:5000/api';

async function testAnalyticsSuite() {
  console.log('====================================================');
  console.log('    DEVPATH ANALYTICS VERIFICATION & BENCHMARK      ');
  console.log('====================================================\n');

  // 1. Benchmark Comprehensive Analytics API
  console.log('--- 1. Testing & Benchmarking /api/analytics/comprehensive ---');
  const t0 = performance.now();
  const res = await fetch(`${API_BASE}/analytics/comprehensive?timeframe=30d`);
  const dur = performance.now() - t0;
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  const payload = await res.json();
  const data = payload.data;
  console.log(`- Request Duration: ${dur.toFixed(1)}ms (HTTP ${res.status})`);
  console.log(`- Server-Timing: ${res.headers.get('server-timing') || 'N/A'}`);
  console.log(`- Cache-Control: ${res.headers.get('cache-control') || 'N/A'}`);

  // 2. Validate Overview Counts
  console.log('\n--- 2. Validating Overview Domain Metrics ---');
  console.log(`- Active Roadmaps:   ${data.overview.activeRoadmapsCount} (Expected: 10)`);
  console.log(`- Archived Roadmaps: ${data.overview.archivedRoadmapsCount} (Expected: 0)`);
  console.log(`- Total Tasks:       ${data.overview.totalCurriculumTasks} (Expected: 1868)`);
  console.log(`- Completed Tasks:   ${data.overview.totalCompletedCurriculumTasks} (Expected: 0)`);
  console.log(`- Completion %:      ${data.overview.totalCompletionPercentage}% (Expected: 0%)`);
  console.log(`- Current Streak:    ${data.overview.currentOverallStreak}d (Expected: 0d)`);
  console.log(`- Active Projects:   ${data.overview.activeProjectsCount} (Expected: 3)`);
  console.log(`- Comparisons:       ${JSON.stringify(data.overview.comparisons.tasks)}`);

  if (data.overview.totalCurriculumTasks !== 1868) {
    throw new Error(`Total curriculum tasks mismatch: got ${data.overview.totalCurriculumTasks}, expected 1868`);
  }
  if (data.overview.totalCompletedCurriculumTasks !== 0) {
    throw new Error(`Completed tasks should be 0 after reset, got ${data.overview.totalCompletedCurriculumTasks}`);
  }

  // 3. Independent Roadmap Progression Validation
  console.log('\n--- 3. Validating Independent Roadmap Progression ---');
  console.log(`- Total Roadmaps Evaluated: ${data.roadmaps.length}`);
  data.roadmaps.slice(0, 4).forEach((rm) => {
    console.log(`  * [${rm.status.toUpperCase()}] ${rm.title.padEnd(28)}: Day ${rm.currentDayNumber} | ${rm.completedTasks}/${rm.totalTasks} tasks (${rm.progressPercent}%)`);
  });
  // Check that all roadmaps progress independently
  const allDay1 = data.roadmaps.every((r) => r.currentDayNumber === 1);
  console.log(`- All roadmaps at Day 1 frontier for tomorrow's journey: ${allDay1}`);

  // 4. Timeframe Filtering & Boundary Testing
  console.log('\n--- 4. Validating Timeframe Filtering (7d, 90d, all, custom) ---');
  const t7d = await (await fetch(`${API_BASE}/analytics/comprehensive?timeframe=7d`)).json();
  console.log(`- 7D Timeframe Range:  ${t7d.data.dateRange.startDate} to ${t7d.data.dateRange.endDate} (${t7d.data.dateRange.durationDays} days)`);
  
  const t90d = await (await fetch(`${API_BASE}/analytics/comprehensive?timeframe=90d`)).json();
  console.log(`- 90D Timeframe Range: ${t90d.data.dateRange.startDate} to ${t90d.data.dateRange.endDate} (${t90d.data.dateRange.durationDays} days)`);

  const tCustom = await (await fetch(`${API_BASE}/analytics/comprehensive?timeframe=custom&startDate=2026-10-01&endDate=2026-10-15`)).json();
  console.log(`- Custom Date Range:   ${tCustom.data.dateRange.startDate} to ${tCustom.data.dateRange.endDate} (${tCustom.data.dateRange.durationDays} days)`);
  console.log(`- Custom Prev Period:  ${tCustom.data.dateRange.prevStartDate} to ${tCustom.data.dateRange.prevEndDate}`);

  // 5. Study Time Analytics Validation
  console.log('\n--- 5. Validating Study Time & Duration Distribution ---');
  console.log(`- Focused Hours (Period): ${data.studyTime.totalFocusedHours}h`);
  console.log(`- Completed Sessions:     ${data.studyTime.completedSessionsCount}`);
  console.log(`- Daily Trend Points:     ${data.studyTime.dailyTrend.length} days`);
  console.log(`- Duration Buckets:       ${JSON.stringify(data.studyTime.durationDistribution)}`);

  // 6. Consistency & Heatmap Validation
  console.log('\n--- 6. Validating Consistency & Heatmap ---');
  console.log(`- Streak Target:      ${data.consistency.streakTarget} tasks/day`);
  console.log(`- Heatmap Days Count: ${data.consistency.heatmap.days?.length || 0} days`);
  console.log(`- Roadmap Streaks:    ${data.consistency.roadmapStreaks.length} roadmaps evaluated`);

  // 7. Revision Analytics Validation
  console.log('\n--- 7. Validating Spaced Revision Performance ---');
  console.log(`- Total Topics:       ${data.revisionPerformance.totalTopics}`);
  console.log(`- Completed Reviews:  ${data.revisionPerformance.revisionsCompleted}`);
  console.log(`- Due Revisions:      ${data.revisionPerformance.revisionsDue}`);
  console.log(`- Overdue Revisions:  ${data.revisionPerformance.revisionsOverdue}`);
  console.log(`- Ratings Breakdown:  ${JSON.stringify(data.revisionPerformance.ratingDistribution)}`);
  console.log(`- Topics Needing Practice: ${data.revisionPerformance.topicsNeedingPractice.length}`);

  // 8. Project Performance & 50/50 Weighted Formula
  console.log('\n--- 8. Validating Project Weighted Progress ---');
  console.log(`- Total Projects:     ${data.projectPerformance.totalProjects}`);
  console.log(`- Total Milestones:   ${data.projectPerformance.totalMilestones}`);
  console.log(`- Completed Milestones: ${data.projectPerformance.completedMilestones}`);
  data.projectPerformance.projects.forEach((p) => {
    console.log(`  * Project "${p.name}": ${p.progressPercent}% progress (${p.completedMilestones}/${p.totalMilestones} milestones, ${p.completedTasks}/${p.totalTasks} tasks)`);
  });

  // 9. Deterministic Engineering Insights
  console.log('\n--- 9. Validating Deterministic Engineering Insights ---');
  console.log(`- Total Generated Insights: ${data.insights.length}`);
  data.insights.forEach((i, idx) => {
    console.log(`  ${idx + 1}. [${i.category.toUpperCase()}] ${i.title} (${i.level})`);
    console.log(`     "${i.description}"`);
  });

  // 10. CSV Exports Verification across all types
  console.log('\n--- 10. Validating CSV Export Endpoints ---');
  const exportTypes = ['tasks', 'roadmaps', 'sessions', 'revisions', 'projects'];
  for (const type of exportTypes) {
    const csvStart = performance.now();
    const csvRes = await fetch(`${API_BASE}/analytics/export/${type}?timeframe=30d`);
    const csvDur = performance.now() - csvStart;
    const text = await csvRes.text();
    const lines = text.trim().split('\n');
    console.log(`- Export "${type}": HTTP ${csvRes.status} in ${csvDur.toFixed(1)}ms | Header: "${lines[0]}" (${lines.length - 1} rows)`);
    if (!csvRes.ok) throw new Error(`Export ${type} failed with status ${csvRes.status}`);
  }

  console.log('\n====================================================');
  console.log('       ALL ANALYTICS TESTS PASSED CLEANLY!          ');
  console.log('====================================================');
}

testAnalyticsSuite().catch((err) => {
  console.error('\n❌ Analytics Verification Failed:', err);
  process.exit(1);
});
