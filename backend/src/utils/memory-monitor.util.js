/**
 * DevPath Structured Memory Monitor
 * Provides lightweight process.memoryUsage() tracking (RSS, heapTotal, heapUsed, external, arrayBuffers)
 * with zero-allocation logging designed for Render's 512MB container environment.
 */

let memoryIntervalId = null;

/**
 * Returns memory usage formatted in Megabytes (MB)
 */
export function getMemorySnapshot() {
  const mem = process.memoryUsage();
  return {
    rssMb: +(mem.rss / (1024 * 1024)).toFixed(2),
    heapTotalMb: +(mem.heapTotal / (1024 * 1024)).toFixed(2),
    heapUsedMb: +(mem.heapUsed / (1024 * 1024)).toFixed(2),
    externalMb: +(mem.external / (1024 * 1024)).toFixed(2),
    arrayBuffersMb: mem.arrayBuffers ? +(mem.arrayBuffers / (1024 * 1024)).toFixed(2) : 0,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Logs structured memory metrics with a specific tag (e.g. 'startup', 'db_connected', 'request')
 */
export function logMemory(tag = 'metric', extra = {}) {
  const snap = getMemorySnapshot();
  const extraStr = Object.keys(extra).length > 0 ? ` | ${JSON.stringify(extra)}` : '';
  console.log(
    `[Memory][${tag}] RSS: ${snap.rssMb}MB | Heap: ${snap.heapUsedMb}/${snap.heapTotalMb}MB | Ext: ${snap.externalMb}MB | Arr: ${snap.arrayBuffersMb}MB${extraStr}`
  );
  return snap;
}

/**
 * Profiles memory delta before and after executing an async operation
 */
export async function profileMemory(operationName, fn) {
  const startSnap = getMemorySnapshot();
  const startTime = Date.now();
  try {
    const result = await fn();
    const durationMs = Date.now() - startTime;
    const endSnap = getMemorySnapshot();
    const deltaRss = +(endSnap.rssMb - startSnap.rssMb).toFixed(2);
    const deltaHeap = +(endSnap.heapUsedMb - startSnap.heapUsedMb).toFixed(2);

    console.log(
      `[MemoryProfile][${operationName}] ${durationMs}ms | RSS: ${startSnap.rssMb} -> ${endSnap.rssMb}MB (${deltaRss >= 0 ? '+' : ''}${deltaRss}MB) | HeapUsed: ${startSnap.heapUsedMb} -> ${endSnap.heapUsedMb}MB (${deltaHeap >= 0 ? '+' : ''}${deltaHeap}MB)`
    );
    return result;
  } catch (error) {
    const durationMs = Date.now() - startTime;
    console.error(`[MemoryProfile][${operationName}] Failed after ${durationMs}ms:`, error.message);
    throw error;
  }
}

/**
 * Starts periodic lightweight memory logging (default every 5 minutes in production)
 */
export function startPeriodicMemoryLogging(intervalMs = 5 * 60 * 1000) {
  if (memoryIntervalId) return;

  // Initial snapshot
  logMemory('monitor_start');

  memoryIntervalId = setInterval(() => {
    const snap = logMemory('periodic');
    // Warning if RSS exceeds 400MB on Render's 512MB tier
    if (snap.rssMb > 400) {
      console.warn(`⚠️ [MemoryWarning] RSS usage is high: ${snap.rssMb}MB / 512MB limit!`);
      if (global.gc) {
        try {
          console.log('[Memory] Manually invoking garbage collection...');
          global.gc();
          logMemory('post_gc');
        } catch (_) {}
      }
    }
  }, intervalMs);

  if (memoryIntervalId.unref) {
    memoryIntervalId.unref(); // Ensure timer doesn't prevent Node process exit
  }
}

/**
 * Stops periodic memory logging
 */
export function stopPeriodicMemoryLogging() {
  if (memoryIntervalId) {
    clearInterval(memoryIntervalId);
    memoryIntervalId = null;
  }
}
