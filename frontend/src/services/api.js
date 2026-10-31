import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const DEFAULT_CACHE_TTL = 30000; // 30 seconds

// Memory caches
const responseCache = new Map();
const inFlightRequests = new Map();

/**
 * Invalidate cached responses matching an optional pattern (string or RegExp).
 * If no pattern is provided, clears the entire cache.
 */
export function invalidateApiCache(pattern) {
  if (!pattern) {
    responseCache.clear();
    return;
  }
  const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
  for (const key of responseCache.keys()) {
    if (regex.test(key)) {
      responseCache.delete(key);
    }
  }
}

/**
 * Auto-invalidation rule mapping mutation URLs to cache patterns.
 */
function autoInvalidateOnMutation(url, method) {
  if (!url) return;
  const upperMethod = (method || '').toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(upperMethod)) {
    if (/tasks|task-completions|personal-tasks/i.test(url)) {
      invalidateApiCache(/dashboard|roadmaps|reminders|analytics/);
    } else if (/roadmaps/i.test(url)) {
      invalidateApiCache(/roadmaps|dashboard|analytics/);
    } else if (/study-sessions/i.test(url)) {
      invalidateApiCache(/study-sessions|dashboard|analytics/);
    } else if (/notifications|reminders/i.test(url)) {
      invalidateApiCache(/notifications|reminders/);
    } else if (/notes/i.test(url)) {
      invalidateApiCache(/notes/);
    } else if (/revisions|revision-schedules/i.test(url)) {
      invalidateApiCache(/revision|dashboard|reminders|analytics/);
    } else if (/projects/i.test(url)) {
      invalidateApiCache(/project|dashboard|reminders|analytics/);
    } else {
      invalidateApiCache(/dashboard|analytics/);
    }
  }
}

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 25000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (requestConfig) => {
    // Attach optional single-user application access secret if configured
    try {
      const secret =
        (typeof window !== 'undefined' ? localStorage.getItem('devpath_access_secret') : null) ||
        import.meta.env.VITE_APP_ACCESS_SECRET;
      if (secret) {
        requestConfig.headers['x-app-access-secret'] = secret;
      }
    } catch {
      // localStorage may be unavailable in some private browsing contexts
    }
    return requestConfig;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    // Automatically invalidate related cached entries on successful mutations
    autoInvalidateOnMutation(response.config?.url, response.config?.method);

    // Return inner data payload if standard response wrapper is present
    return response.data?.data !== undefined ? response.data.data : response.data;
  },
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

/**
 * Wrapped API client with In-Flight Deduplication and In-Memory Caching for GET requests.
 */
const api = {
  ...axiosInstance,

  get(url, config = {}) {
    const { skipCache = false, cacheTtl = DEFAULT_CACHE_TTL, ...axiosConfig } = config;

    // Generate unique request key from URL and params
    const sortedParams = axiosConfig.params
      ? JSON.stringify(Object.keys(axiosConfig.params).sort().reduce((acc, k) => {
          acc[k] = axiosConfig.params[k];
          return acc;
        }, {}))
      : '';
    const cacheKey = `GET:${url}:${sortedParams}`;

    // 1. Check in-memory cache if not skipping cache
    if (!skipCache) {
      const cached = responseCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < (cached.ttl || DEFAULT_CACHE_TTL)) {
        return Promise.resolve(cached.data);
      }
    }

    // 2. Check if an identical request is already in-flight (deduplication)
    if (inFlightRequests.has(cacheKey)) {
      return inFlightRequests.get(cacheKey);
    }

    // 3. Initiate request and track in-flight promise
    const requestPromise = axiosInstance.get(url, axiosConfig)
      .then((data) => {
        // Cache successful response
        responseCache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl: cacheTtl,
        });
        return data;
      })
      .finally(() => {
        // Clean up in-flight tracker once settled
        inFlightRequests.delete(cacheKey);
      });

    inFlightRequests.set(cacheKey, requestPromise);
    return requestPromise;
  },

  post(url, data, config) {
    return axiosInstance.post(url, data, config);
  },

  put(url, data, config) {
    return axiosInstance.put(url, data, config);
  },

  patch(url, data, config) {
    return axiosInstance.patch(url, data, config);
  },

  delete(url, config) {
    return axiosInstance.delete(url, config);
  },

  request(config) {
    return axiosInstance.request(config);
  },
};

export default api;

