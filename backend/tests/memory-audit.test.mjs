import app from '../src/app.js';
import { prisma } from '../src/config/db.js';
import { getMemorySnapshot, profileMemory } from '../src/utils/memory-monitor.util.js';

async function runAudit() {
  console.log('====================================================');
  console.log('🧪 DEVPATH BACKEND MEMORY & ENDPOINT AUDIT');
  console.log('====================================================');

  const initialSnap = getMemorySnapshot();
  console.log(`[Baseline Memory] RSS: ${initialSnap.rssMb}MB | Heap: ${initialSnap.heapUsedMb}/${initialSnap.heapTotalMb}MB`);

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  const endpoints = [
    { name: 'GET /categories', url: `${baseUrl}/categories` },
    { name: 'GET /notifications/unread-count', url: `${baseUrl}/notifications/unread-count` },
    { name: 'GET /roadmaps?limit=100&summaryOnly=true', url: `${baseUrl}/roadmaps?limit=100&summaryOnly=true` },
    { name: 'GET /notifications/preferences', url: `${baseUrl}/notifications/preferences` },
    { name: 'GET /study-sessions/active', url: `${baseUrl}/study-sessions/active` },
    { name: 'GET /dashboard/stats', url: `${baseUrl}/dashboard/stats` },
    { name: 'GET /study-sessions/analytics', url: `${baseUrl}/study-sessions/analytics` },
  ];

  console.log('\n--- 1. Single Endpoint Latency & Memory Footprint ---');
  for (const ep of endpoints) {
    const start = performance.now();
    const memBefore = getMemorySnapshot();
    const res = await fetch(ep.url);
    const durationMs = (performance.now() - start).toFixed(1);
    const memAfter = getMemorySnapshot();
    const deltaHeap = (memAfter.heapUsedMb - memBefore.heapUsedMb).toFixed(2);
    const deltaRss = (memAfter.rssMb - memBefore.rssMb).toFixed(2);

    console.log(
      `${ep.name.padEnd(45)} | Status: ${res.status} | Time: ${durationMs.padStart(7)}ms | HeapDelta: ${deltaHeap >= 0 ? '+' : ''}${deltaHeap}MB | RSS: ${memAfter.rssMb}MB`
    );
    if (!res.ok) {
      const txt = await res.text();
      console.error(`  ❌ Error response:`, txt.slice(0, 200));
    }
  }

  console.log('\n--- 2. Concurrent 7-Request Dashboard Burst ---');
  const burstBefore = getMemorySnapshot();
  const burstStart = performance.now();
  const responses = await Promise.all(
    endpoints.map(async (ep) => {
      const s = performance.now();
      const r = await fetch(ep.url);
      const d = (performance.now() - s).toFixed(1);
      return { name: ep.name, status: r.status, timeMs: d };
    })
  );
  const burstDuration = (performance.now() - burstStart).toFixed(1);
  const burstAfter = getMemorySnapshot();

  console.log(`Concurrent burst finished in ${burstDuration}ms:`);
  responses.forEach((r) => {
    console.log(`  ${r.name.padEnd(45)} -> Status ${r.status} (${r.timeMs}ms)`);
  });
  console.log(
    `[Burst Memory] RSS: ${burstBefore.rssMb}MB -> ${burstAfter.rssMb}MB (Delta: ${(burstAfter.rssMb - burstBefore.rssMb).toFixed(2)}MB) | HeapUsed: ${burstBefore.heapUsedMb}MB -> ${burstAfter.heapUsedMb}MB`
  );

  console.log('\n--- 3. Stress Loop: 5 Sequential Dashboard Refreshes ---');
  for (let i = 1; i <= 5; i++) {
    const loopStart = performance.now();
    await Promise.all(endpoints.map((ep) => fetch(ep.url)));
    const loopTime = (performance.now() - loopStart).toFixed(1);
    const snap = getMemorySnapshot();
    console.log(`  Cycle ${i}: ${loopTime}ms | RSS: ${snap.rssMb}MB | HeapUsed: ${snap.heapUsedMb}MB`);
  }

  const finalSnap = getMemorySnapshot();
  console.log('\n====================================================');
  console.log(`🏁 FINAL AUDIT SUMMARY:`);
  console.log(`Baseline RSS: ${initialSnap.rssMb}MB -> Final RSS: ${finalSnap.rssMb}MB`);
  console.log(`Baseline Heap: ${initialSnap.heapUsedMb}MB -> Final Heap: ${finalSnap.heapUsedMb}MB`);
  console.log('====================================================\n');

  server.close();
  await prisma.$disconnect();
  process.exit(0);
}

runAudit().catch(async (err) => {
  console.error('Audit failed:', err);
  await prisma.$disconnect();
  process.exit(1);
});
