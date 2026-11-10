import type { Testimonial } from "@/types/currentLang.interface";

/** Width of a card (340) plus the gap between cards (24), in px. */
export const CARD_SPAN = 364;

/**
 * How wide one half of a lane must be so that, whatever the screen, the loop
 * never shows an empty edge: the track is two halves and slides by exactly one.
 */
export const MIN_HALF_SPAN = 2560;

/** Seconds a lane takes to cross one card (about 26 px/s), and its floor. */
export const SECONDS_PER_CARD = 14;
export const MIN_LANE_SECONDS = 50;

const time = (t: Testimonial) => {
	const ms = Date.parse(t.created_at);
	return Number.isNaN(ms) ? 0 : ms;
};

/** Newest first; the id breaks ties so the order never flickers between renders. */
export const newestFirst = (data: readonly Testimonial[]): Testimonial[] =>
	[...data].sort((a, b) => time(b) - time(a) || b.comment_id - a.comment_id);

/**
 * Two lanes read as one list in order of publication: the newest on the top
 * lane, the next one below, the third on top again, and so on.
 */
export const splitIntoLanes = (data: readonly Testimonial[]) => {
	const sorted = newestFirst(data);
	return {
		top: sorted.filter((_, i) => i % 2 === 0),
		bottom: sorted.filter((_, i) => i % 2 === 1),
	};
};

/** Repeats a lane's cards until one half of the track is wide enough. */
export const repeatToFill = <T>(items: readonly T[]): T[] => {
	if (items.length === 0) return [];
	const times = Math.max(
		1,
		Math.ceil(MIN_HALF_SPAN / (items.length * CARD_SPAN)),
	);
	return Array.from({ length: times }, () => items).flat();
};

/** Seconds one half of the lane takes to slide by, at the same speed on every lane. */
export const laneSeconds = (cardsInHalf: number) =>
	Math.max(MIN_LANE_SECONDS, cardsInHalf * SECONDS_PER_CARD);
