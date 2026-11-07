/**
 * Normalizes and validates Supabase / Postgres connection strings for Prisma
 * to prevent Supavisor `bad_startup_payload` protocol errors and handshake timeouts.
 */
export function normalizePrismaUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return rawUrl;

  try {
    let clean = rawUrl.trim();
    // Strip surrounding quotes if accidentally included in environment variables
    if (
      (clean.startsWith('"') && clean.endsWith('"')) ||
      (clean.startsWith("'") && clean.endsWith("'"))
    ) {
      clean = clean.slice(1, -1).trim();
    }

    const u = new URL(clean);

    // 1. Ensure pathname is not empty or root-only (must specify database name, default 'postgres')
    if (!u.pathname || u.pathname === '/' || u.pathname === '') {
      u.pathname = '/postgres';
    }

    // 2. Remove empty search parameters which trigger Supavisor's `:bad_startup_payload`
    const toDelete = [];
    u.searchParams.forEach((val, key) => {
      if (val === '' || val === undefined || val === null) {
        toDelete.push(key);
      }
    });
    toDelete.forEach((k) => u.searchParams.delete(k));

    // 3. For Supabase transaction pooler (port 6543), pgbouncer=true is required by Prisma
    if (u.port === '6543' && !u.searchParams.has('pgbouncer')) {
      u.searchParams.set('pgbouncer', 'true');
    }

    // 4. Ensure SSL mode and connection timeouts for Supabase hosts
    if (u.hostname.includes('supabase.com') || u.hostname.includes('supabase.co')) {
      if (!u.searchParams.has('sslmode')) {
        u.searchParams.set('sslmode', 'require');
      }
      if (!u.searchParams.has('connect_timeout')) {
        u.searchParams.set('connect_timeout', '30');
      }
      if (!u.searchParams.has('pool_timeout')) {
        u.searchParams.set('pool_timeout', '30');
      }
      if (!u.searchParams.has('connection_limit')) {
        u.searchParams.set('connection_limit', '15');
      }
    }

    return u.toString();
  } catch (err) {
    // If URL parsing fails, return original trimmed string
    return rawUrl.trim();
  }
}
