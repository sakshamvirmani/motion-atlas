import { getD1 } from "@/db";

let rateLimitSchemaReady: Promise<void> | null = null;

type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
};

export async function checkAccountRateLimit({
  userId,
  action,
  limit,
  windowMs,
}: {
  userId: string;
  action: string;
  limit: number;
  windowMs: number;
}): Promise<RateLimitResult> {
  await ensureRateLimitSchema();
  const now = Date.now();
  const windowStartedAt = Math.floor(now / windowMs) * windowMs;
  const result = await getD1()
    .prepare(
      `INSERT INTO mutation_rate_limits
        (user_id, action, window_started_at, request_count, updated_at)
       VALUES (?, ?, ?, 1, ?)
       ON CONFLICT(user_id, action) DO UPDATE SET
        window_started_at = CASE
          WHEN mutation_rate_limits.window_started_at < excluded.window_started_at
          THEN excluded.window_started_at
          ELSE mutation_rate_limits.window_started_at
        END,
        request_count = CASE
          WHEN mutation_rate_limits.window_started_at < excluded.window_started_at
          THEN 1
          WHEN mutation_rate_limits.request_count <= ?
          THEN mutation_rate_limits.request_count + 1
          ELSE mutation_rate_limits.request_count
        END,
        updated_at = excluded.updated_at
       RETURNING request_count, window_started_at`,
    )
    .bind(userId, action, windowStartedAt, now, limit)
    .first<{ request_count: number; window_started_at: number }>();

  const count = Number(result?.request_count ?? limit + 1);
  const activeWindow = Number(result?.window_started_at ?? windowStartedAt);
  return {
    allowed: count <= limit,
    limit,
    remaining: Math.max(0, limit - count),
    retryAfterSeconds: Math.max(
      1,
      Math.ceil((activeWindow + windowMs - now) / 1_000),
    ),
  };
}

async function ensureRateLimitSchema() {
  if (!rateLimitSchemaReady) {
    rateLimitSchemaReady = getD1()
      .prepare(`CREATE TABLE IF NOT EXISTS mutation_rate_limits (
        user_id TEXT NOT NULL,
        action TEXT NOT NULL,
        window_started_at INTEGER NOT NULL,
        request_count INTEGER DEFAULT 1 NOT NULL,
        updated_at INTEGER NOT NULL,
        PRIMARY KEY (user_id, action)
      )`)
      .run()
      .then(() => undefined)
      .catch((error) => {
        rateLimitSchemaReady = null;
        throw error;
      });
  }
  await rateLimitSchemaReady;
}

export function rateLimitedResponse(result: RateLimitResult) {
  return Response.json(
    { error: "Too many account requests. Your saved progress is safe; try again shortly." },
    {
      status: 429,
      headers: {
        "cache-control": "no-store",
        "retry-after": String(result.retryAfterSeconds),
        "x-ratelimit-limit": String(result.limit),
        "x-ratelimit-remaining": String(result.remaining),
      },
    },
  );
}
