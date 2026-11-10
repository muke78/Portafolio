/**
 * Limite de peticiones de las rutas publicas de escritura.
 *
 * En Cloudflare lo decide el binding `RL_PUBLIC_WRITE` (Rate Limiting de Workers), que
 * comparte el contador entre todos los isolates. Sin el binding (`pnpm dev`, pruebas)
 * cae al contador en memoria de abajo: sirve para un solo proceso, pero en Workers cada
 * isolate tiene el suyo, asi que ahi NO es una garantia.
 */
interface SharedLimiter {
	limit(options: { key: string }): Promise<{ success: boolean }>;
}

let warnedMissingBinding = false;

/** Avisa UNA vez por isolate: sin el binding el limite deja de ser global. */
const warnMissingBinding = () => {
	if (warnedMissingBinding) return;
	warnedMissingBinding = true;
	console.error(
		"[rate-limit] El binding RL_PUBLIC_WRITE no esta disponible: se usa el contador en memoria de este isolate, que NO es un limite global. Revisa wrangler.jsonc y el despliegue.",
	);
};

/** Solo para pruebas: vuelve a permitir el aviso. */
export const resetMissingBindingWarning = () => {
	warnedMissingBinding = false;
};

export const sharedLimiter = async ({
	dev = import.meta.env.DEV,
	load = () => import("cloudflare:workers") as Promise<{ env: unknown }>,
}: {
	dev?: boolean;
	load?: () => Promise<{ env: unknown }>;
} = {}): Promise<SharedLimiter | null> => {
	if (dev) return null;
	try {
		const { env } = await load();
		const candidate = (env as { RL_PUBLIC_WRITE?: Partial<SharedLimiter> })
			.RL_PUBLIC_WRITE;
		if (typeof candidate?.limit === "function") {
			return candidate as SharedLimiter;
		}
	} catch {
		// cae al aviso de abajo
	}
	warnMissingBinding();
	return null;
};

/** `true` si la clave ya agoto su cupo. Con el binding manda su limite; sin el, `options`. */
export const checkRateLimit = async (
	key: string,
	options: { limit: number; windowMs: number },
): Promise<boolean> => {
	const shared = await sharedLimiter();
	if (shared) return !(await shared.limit({ key })).success;
	return isRateLimited(key, options);
};

/**
 * Minimal in-memory sliding-window rate limiter. Doesn't survive a cold
 * start of the runtime, but raises the bar against naive flooding of the
 * public write endpoints within a warm instance, with zero extra infra.
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
