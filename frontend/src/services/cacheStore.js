/**
 * Persistent Stale-While-Revalidate (SWR) Cache Store for DevPath
 * Primary Storage: IndexedDB (non-blocking, large quota, persists across sessions)
 * Fast Tier: In-memory Map (0ms synchronous read access)
 * Fallback: localStorage (if IndexedDB unavailable)
 */

const DB_NAME = 'devpath_cache_db';
const STORE_NAME = 'swr_cache';
const DB_VERSION = 1;
const CACHE_VERSION_PREFIX = 'dp_v3:';
const DEFAULT_TTL_MS = 60 * 1000; // 1 minute default
const MAX_MEMORY_ENTRIES = 250;

// In-memory tier for 0ms synchronous access
const memoryCache = new Map();
const listeners = new Set();
let dbPromise = null;
let isInitialized = false;

// Open or get IndexedDB instance safely
function getDb() {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve) => {
      try {
        const req = window.indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'key' });
          }
        };
        req.onsuccess = (e) => resolve(e.target.result);
        req.onerror = () => {
          console.warn('[CacheStore] IndexedDB failed to open, using memory/localStorage fallback');
          resolve(null);
        };
      } catch (err) {
        console.warn('[CacheStore] IndexedDB initialization error:', err);
        resolve(null);
      }
    });
  }
  return dbPromise;
}

// Ensure key is sanitized and version-prefixed
function sanitizeKey(key) {
  if (typeof key !== 'string') return `${CACHE_VERSION_PREFIX}${JSON.stringify(key)}`;
  return key.startsWith(CACHE_VERSION_PREFIX) ? key : `${CACHE_VERSION_PREFIX}${key}`;
}

// Security guard: ensure secrets/credentials never get cached
function isCacheSafe(key, data) {
  const keyLower = String(key).toLowerCase();
  if (
    keyLower.includes('secret') ||
    keyLower.includes('password') ||
    keyLower.includes('token') ||
    keyLower.includes('auth')
  ) {
    return false;
  }
  return true;
}

export const cacheStore = {
  /**
   * Warm up memory cache from persistent store on app mount.
   */
  async init() {
    if (isInitialized || typeof window === 'undefined') return;
    try {
      const db = await getDb();
      if (db) {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();

        await new Promise((resolve) => {
          req.onsuccess = () => {
            const records = req.result || [];
            const now = Date.now();
            records.forEach((rec) => {
              // Only hydrate non-expired records
              if (rec && rec.key && (!rec.expiresAt || rec.expiresAt > now)) {
                memoryCache.set(rec.key, rec);
              }
            });
            resolve();
          };
          req.onerror = () => resolve();
        });
      } else {
        // Fallback: load keys from localStorage
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(CACHE_VERSION_PREFIX)) {
            try {
              const val = JSON.parse(localStorage.getItem(k));
              if (val && (!val.expiresAt || val.expiresAt > Date.now())) {
                memoryCache.set(k, val);
              }
            } catch {
              localStorage.removeItem(k);
            }
          }
        }
      }
    } catch (err) {
      console.warn('[CacheStore] Hydration error:', err);
    } finally {
      isInitialized = true;
    }
  },

  /**
   * Synchronous get (memory tier only - 0ms perceived latency)
   */
  getSync(key) {
    const sKey = sanitizeKey(key);
    const entry = memoryCache.get(sKey);
    if (!entry) return null;
    return entry.data;
  },

  /**
   * Get entry with metadata (data, isStale, timestamp)
   */
  getEntry(key) {
    const sKey = sanitizeKey(key);
    const entry = memoryCache.get(sKey);
    if (!entry) return null;
    const now = Date.now();
    const isStale = entry.expiresAt ? now > entry.expiresAt : false;
    return {
      data: entry.data,
      isStale,
      timestamp: entry.timestamp,
      ttl: entry.ttl,
    };
  },

  /**
   * Asynchronous get: checks memory first, then IndexedDB if not found
   */
  async get(key) {
    const sKey = sanitizeKey(key);
    const mem = memoryCache.get(sKey);
    if (mem) return mem.data;

    try {
      const db = await getDb();
      if (db) {
        return new Promise((resolve) => {
          const tx = db.transaction(STORE_NAME, 'readonly');
          const store = tx.objectStore(STORE_NAME);
          const req = store.get(sKey);
          req.onsuccess = () => {
            const rec = req.result;
            if (rec && (!rec.expiresAt || rec.expiresAt > Date.now())) {
              memoryCache.set(sKey, rec);
              resolve(rec.data);
            } else {
              resolve(null);
            }
          };
          req.onerror = () => resolve(null);
        });
      }
    } catch {
      return null;
    }
    return null;
  },

  /**
   * Save data into both Memory and Persistent store.
   */
  async set(key, data, ttlMs = DEFAULT_TTL_MS) {
    const sKey = sanitizeKey(key);
    if (!isCacheSafe(sKey, data)) return;

    const now = Date.now();
    const entry = {
      key: sKey,
      data,
      timestamp: now,
      ttl: ttlMs,
      expiresAt: ttlMs > 0 ? now + ttlMs : null,
    };

    // 1. Write to memory cache
    memoryCache.set(sKey, entry);

    // Evict oldest if memory cache grows too large
    if (memoryCache.size > MAX_MEMORY_ENTRIES) {
      const firstKey = memoryCache.keys().next().value;
      if (firstKey) memoryCache.delete(firstKey);
    }

    // 2. Persist to IndexedDB asynchronously
    try {
      const db = await getDb();
      if (db) {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(entry);
      } else {
        // Fallback localStorage
        try {
          localStorage.setItem(sKey, JSON.stringify(entry));
        } catch {
          // Quota exceeded: clear older localStorage cache entries
          this.purgeOldLocalStorage();
        }
      }
    } catch (err) {
      console.warn('[CacheStore] Persist error:', err);
    }

    // Notify active subscribers
    this.notify(sKey, data);
  },

  /**
   * Delete entry from both Memory and Persistent store.
   */
  async delete(key) {
    const sKey = sanitizeKey(key);
    memoryCache.delete(sKey);

    try {
      const db = await getDb();
      if (db) {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.delete(sKey);
      } else {
        localStorage.removeItem(sKey);
      }
    } catch (err) {
      console.warn('[CacheStore] Delete error:', err);
    }

    this.notify(sKey, null);
  },

  /**
   * Invalidate all keys matching a regex or string pattern.
   */
  async invalidate(pattern) {
    const regex = !pattern
      ? null
      : typeof pattern === 'string'
      ? new RegExp(pattern, 'i')
      : pattern;

    const matchingKeys = [];
    for (const k of memoryCache.keys()) {
      if (!regex || regex.test(k)) {
        matchingKeys.push(k);
      }
    }

    matchingKeys.forEach((k) => memoryCache.delete(k));

    try {
      const db = await getDb();
      if (db) {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        if (!regex) {
          store.clear();
        } else {
          matchingKeys.forEach((k) => store.delete(k));
        }
      } else {
        if (!regex) {
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const k = localStorage.key(i);
            if (k && k.startsWith(CACHE_VERSION_PREFIX)) {
              localStorage.removeItem(k);
            }
          }
        } else {
          matchingKeys.forEach((k) => localStorage.removeItem(k));
        }
      }
    } catch (err) {
      console.warn('[CacheStore] Invalidate error:', err);
    }

    // Broadcast cache invalidation event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('devpath:cache-invalidated', {
          detail: { pattern: pattern ? String(pattern) : 'all', keys: matchingKeys },
        })
      );
    }
  },

  /**
   * Subscribe to cache updates for reactive re-rendering
   */
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  notify(key, data) {
    listeners.forEach((fn) => {
      try {
        fn(key, data);
      } catch (err) {
        console.error('[CacheStore] Listener error:', err);
      }
    });
  },

  /**
   * Clean up older localStorage keys if storage quota is tight
   */
  purgeOldLocalStorage() {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(CACHE_VERSION_PREFIX)) {
          keys.push(k);
        }
      }
      // Remove half of them to free space
      keys.slice(0, Math.ceil(keys.length / 2)).forEach((k) => localStorage.removeItem(k));
    } catch {
      // Ignore
    }
  },
};

// Auto-warmup on module import
if (typeof window !== 'undefined') {
  cacheStore.init();
}
