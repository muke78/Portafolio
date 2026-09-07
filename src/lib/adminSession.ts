import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "khelde_admin";
const MAX_AGE_SECONDS = 60 * 60 * 8;

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

export const verifySessionToken = (
	token: string | undefined,
	secret: string,
): boolean => {
	if (!token) return false;
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
