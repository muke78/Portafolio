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

// The Hono-issued JWT is itself "header.payload.signature" - embedding it
// raw would break the "split by dot" parsing below (it has two dots of
// its own). base64url-encoding it collapses it into one opaque segment,
// so the outer token stays a clean 3-part `${exp}.${honoJwtB64}.${sig}`
// - and the HMAC signs exp+jwt together, so the embedded JWT can't be
// swapped out without invalidating the outer signature.
const encodeHonoJwt = (honoJwt: string): string =>
	Buffer.from(honoJwt, "utf8").toString("base64url");

const decodeHonoJwt = (encoded: string): string =>
	Buffer.from(encoded, "base64url").toString("utf8");

export const buildSessionToken = (secret: string, honoJwt: string): string => {
	const exp = Date.now() + MAX_AGE_SECONDS * 1000;
	const payload = `${exp}.${encodeHonoJwt(honoJwt)}`;
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

// Shared by verifySessionToken/getHonoJwt so both agree on exactly what
// "valid" means (signature, then expiry) - returns the raw exp string on
// success, null on any failure, without ever throwing on a malformed
// cookie value.
const verifyAndGetExp = (
	token: string | undefined,
	secret: string,
): { exp: string; honoJwtB64: string } | null => {
	if (!token) return null;
	if (revokedTokens.has(token)) return null;
	const [exp, honoJwtB64, sig] = token.split(".");
	if (!exp || !honoJwtB64 || !sig) return null;
	const payload = `${exp}.${honoJwtB64}`;
	const expected = sign(payload, secret);
	const a = encoder.encode(sig);
	const b = encoder.encode(expected);
	if (a.length !== b.length) return null;
	if (!timingSafeEqual(a, b)) return null;
	const expNum = Number(exp);
	if (!Number.isFinite(expNum) || Date.now() > expNum) return null;
	return { exp, honoJwtB64 };
};

export const verifySessionToken = (
	token: string | undefined,
	secret: string,
): boolean => verifyAndGetExp(token, secret) !== null;

/** Extracts the Hono-issued JWT embedded in a valid session cookie, or
 * null if the cookie is missing/tampered/expired/revoked. */
export const getHonoJwt = (
	token: string | undefined,
	secret: string,
): string | null => {
	const verified = verifyAndGetExp(token, secret);
	if (!verified) return null;
	return decodeHonoJwt(verified.honoJwtB64);
};

export const SESSION_COOKIE = COOKIE_NAME;
export const SESSION_MAX_AGE = MAX_AGE_SECONDS;
