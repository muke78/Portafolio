import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "khelde_admin";
// Short-lived on purpose: this is a single-admin panel, not a multi-user
// app, so trading a bit of re-login friction for a tighter exposure
// window on a leaked/stolen cookie is the right call.
const MAX_AGE_SECONDS = 60 * 60 * 2;

const encoder = new TextEncoder();

const sign = (payload: string, secret: string): string => {
	return createHmac("sha256", secret).update(payload).digest("hex");
};

export const buildSessionToken = (secret: string): string => {
	const exp = Date.now() + MAX_AGE_SECONDS * 1000;
	const payload = String(exp);
	const sig = sign(payload, secret);
	return `${payload}.${sig}`;
};

// In-memory revocation list so logout actually invalidates the token
// server-side, not just the cookie client-side. Doesn't survive a cold
// start on serverless (Vercel Fluid Compute reuses warm instances across
// requests, but a fresh instance starts with an empty set) - that's a
// known, accepted limitation for a single-admin panel with no other
// infra; it still closes the common case (log out on this machine, the
// old token stops working on this machine's warm instance).
const revokedTokens = new Map<string, number>(); // token -> its own expiry

const pruneExpiredRevocations = () => {
	const now = Date.now();
	for (const [token, exp] of revokedTokens) {
		if (exp <= now) revokedTokens.delete(token);
	}
};

export const revokeSessionToken = (token: string | undefined): void => {
	if (!token) return;
	const [payload] = token.split(".");
	const exp = Number(payload);
	revokedTokens.set(token, Number.isFinite(exp) ? exp : Date.now());
	pruneExpiredRevocations();
};

export const verifySessionToken = (
	token: string | undefined,
	secret: string,
): boolean => {
	if (!token) return false;
	if (revokedTokens.has(token)) return false;
	const [payload, sig] = token.split(".");
	if (!payload || !sig) return false;
	const expected = sign(payload, secret);
	const a = encoder.encode(sig);
	const b = encoder.encode(expected);
	if (a.length !== b.length) return false;
	if (!timingSafeEqual(a, b)) return false;
	const exp = Number(payload);
	if (!Number.isFinite(exp) || Date.now() > exp) return false;
	return true;
};

export const SESSION_COOKIE = COOKIE_NAME;
export const SESSION_MAX_AGE = MAX_AGE_SECONDS;
