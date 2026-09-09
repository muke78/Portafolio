/**
 * Minimal in-memory sliding-window rate limiter. Same caveat as the
 * session revocation list in adminSession.ts: doesn't survive a cold
 * start on serverless, but raises the bar against naive brute-forcing
 * of the admin login within a warm instance, with zero extra infra.
 */
const buckets = new Map<string, { count: number; windowStart: number }>();

export const isRateLimited = (
	key: string,
	{ limit, windowMs }: { limit: number; windowMs: number },
): boolean => {
	const now = Date.now();
	const bucket = buckets.get(key);

	if (!bucket || now - bucket.windowStart > windowMs) {
		buckets.set(key, { count: 1, windowStart: now });
		// Opportunistic cleanup of other keys' stale windows, so a
		// long-lived warm instance doesn't accumulate one entry per
		// IP forever.
		for (const [k, b] of buckets) {
			if (k !== key && now - b.windowStart > windowMs) buckets.delete(k);
		}
		return false;
	}

	bucket.count += 1;
	return bucket.count > limit;
};
