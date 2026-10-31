async function test() {
  console.log('Testing GET /api/analytics/comprehensive...');
  const start = performance.now();
  const res = await fetch('http://localhost:5000/api/analytics/comprehensive?timeframe=30d');
  const dur = performance.now() - start;
  const json = await res.json();
  console.log(`Status: ${res.status} (${dur.toFixed(1)}ms)`);
  console.log('Data keys:', Object.keys(json.data || {}));
  console.log('Overview:', json.data?.overview);
  console.log('Roadmaps count:', json.data?.roadmaps?.length);
  console.log('Study Time summary:', {
    totalHours: json.data?.studyTime?.totalFocusedHours,
    dailyPoints: json.data?.studyTime?.dailyTrend?.length,
  });
  console.log('Insights count:', json.data?.insights?.length);
  console.log('Insights titles:', json.data?.insights?.map(i => i.title));

  console.log('\nTesting CSV export...');
  const csvRes = await fetch('http://localhost:5000/api/analytics/export/roadmaps');
  const csvText = await csvRes.text();
  console.log('CSV Status:', csvRes.status);
  console.log('CSV preview:\n', csvText.split('\n').slice(0, 5).join('\n'));
}

test().catch(console.error);
