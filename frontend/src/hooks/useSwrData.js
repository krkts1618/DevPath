import { useState, useEffect, useRef, useCallback } from 'react';
import { cacheStore } from '../services/cacheStore';

/**
 * Custom Stale-While-Revalidate (SWR) hook for React components.
 * Renders cached data immediately (0ms), validates & updates in background.
 *
 * @param {string|null} key - Cache identifier (e.g. 'dashboard', 'roadmaps:list')
 * @param {Function} fetcher - Async function returning fresh data
 * @param {Object} options - Configuration options
 * @param {number} [options.ttl=60000] - Cache time-to-live in ms
 * @param {boolean} [options.revalidateOnMount=true] - Revalidate when component mounts
 * @param {boolean} [options.keepPreviousData=true] - Keep stale data visible while revalidating
 * @param {*} [options.initialFallback=null] - Default fallback before any cache or fetch
 */
export function useSwrData(key, fetcher, options = {}) {
  const {
    ttl = 60000,
    revalidateOnMount = true,
    keepPreviousData = true,
    initialFallback = null,
  } = options;

  // 1. Synchronously try to read from memory cache for instant 0ms mount
  const syncCached = key ? cacheStore.getSync(key) : null;

  const [data, setData] = useState(() => (syncCached !== null ? syncCached : initialFallback));
  const [loading, setLoading] = useState(() => syncCached === null && Boolean(key));
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState(null);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const keyRef = useRef(key);
  keyRef.current = key;

  // Background fetcher runner
  const executeRevalidation = useCallback(async (isInitial = false) => {
    const currentKey = keyRef.current;
    if (!currentKey || !fetcherRef.current) return;

    setIsValidating(true);
    try {
      const freshData = await fetcherRef.current();
      // Ensure key hasn't changed during in-flight request
      if (keyRef.current === currentKey && freshData !== undefined) {
        setData(freshData);
        setError(null);
        await cacheStore.set(currentKey, freshData, ttl);
      }
    } catch (err) {
      if (keyRef.current === currentKey) {
        console.warn(`[useSwrData] Background revalidation failed for "${currentKey}":`, err.message);
        setError(err);
        // Do NOT wipe out existing data on background error
      }
    } finally {
      if (keyRef.current === currentKey) {
        setIsValidating(false);
        setLoading(false);
      }
    }
  }, [ttl]);

  // Main effect: check persistent cache if not in memory, then revalidate
  useEffect(() => {
    if (!key) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function loadInitial() {
      // If already hydrated synchronously, check if stale
      const entry = cacheStore.getEntry(key);
      if (entry && entry.data !== null) {
        if (isMounted) {
          setData(entry.data);
          setLoading(false);
        }
        if (revalidateOnMount) {
          executeRevalidation(true);
        }
        return;
      }

      // Check persistent IndexedDB tier
      const asyncData = await cacheStore.get(key);
      if (!isMounted) return;

      if (asyncData !== null) {
        setData(asyncData);
        setLoading(false);
      } else if (!keepPreviousData) {
        setLoading(true);
      }

      if (revalidateOnMount) {
        executeRevalidation(true);
      } else if (asyncData === null) {
        // If no cache at all, we must fetch
        executeRevalidation(true);
      }
    }

    loadInitial();

    // Listen to cache updates and invalidation events
    const unsubscribe = cacheStore.subscribe((updatedKey, updatedData) => {
      if (isMounted && keyRef.current && (updatedKey === keyRef.current || updatedKey.endsWith(keyRef.current))) {
        if (updatedData !== null) {
          setData(updatedData);
        }
      }
    });

    const handleInvalidation = (e) => {
      const { pattern } = e.detail || {};
      if (!isMounted || !keyRef.current) return;
      if (pattern === 'all') {
        executeRevalidation();
        return;
      }
      try {
        const reg = new RegExp(pattern, 'i');
        if (reg.test(keyRef.current)) {
          executeRevalidation();
        }
      } catch {
        // ignore regex error
      }
    };

    window.addEventListener('devpath:cache-invalidated', handleInvalidation);

    return () => {
      isMounted = false;
      unsubscribe();
      window.removeEventListener('devpath:cache-invalidated', handleInvalidation);
    };
  }, [key, revalidateOnMount, keepPreviousData, executeRevalidation]);

  /**
   * Optimistically update state and cache with rollback capability.
   */
  const mutate = useCallback(async (optimisticData, shouldRevalidate = true) => {
    const currentKey = keyRef.current;
    if (!currentKey) return;

    const previousData = data;

    // 1. Immediately apply optimistic data
    setData(optimisticData);
    await cacheStore.set(currentKey, optimisticData, ttl);

    // 2. Revalidate with server if requested
    if (shouldRevalidate) {
      try {
        await executeRevalidation();
      } catch (err) {
        // Rollback on server failure
        console.warn(`[useSwrData] Mutation failed, rolling back "${currentKey}":`, err.message);
        setData(previousData);
        await cacheStore.set(currentKey, previousData, ttl);
        throw err;
      }
    }
  }, [data, ttl, executeRevalidation]);

  return {
    data,
    loading,
    isValidating,
    error,
    mutate,
    reload: () => executeRevalidation(false),
  };
}
