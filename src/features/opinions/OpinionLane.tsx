import type { CSSProperties } from "react";
import { laneSeconds, repeatToFill } from "@/features/opinions/lanes";
import { OpinionCard } from "@/features/opinions/OpinionCard";
import type { Testimonial } from "@/types/currentLang.interface";

interface OpinionLaneProps {
	items: readonly Testimonial[];
	/** Which way the lane slides. The motion engine reads it from `data-marquee-dir`. */
	direction: "left" | "right";
	dateLocale: string;
	noCountry: string;
}

/**
 * One lane of the opinions reel: a track made of two identical halves that the
 * motion engine slides by exactly one half (see `marquees` in lib/motion/media.ts).
 * Without JS the same loop runs in CSS; with reduced motion it is a plain
 * strip you scroll with the finger or the wheel.
 */
export const OpinionLane = ({
	items,
	direction,
	dateLocale,
	noCountry,
}: OpinionLaneProps) => {
	if (items.length === 0) return null;
	const half = repeatToFill(items);
	const cards = [...half, ...half];

	return (
		<div
			data-marquee
			data-marquee-dir={direction}
			data-mask="left"
			className="relative w-full overflow-hidden motion-reduce:overflow-x-auto"
			style={
				{
					"--marquee-duration": `${laneSeconds(half.length)}s`,
				} as CSSProperties
			}
		>
			{/* Edge fade as two static overlays: a mask over moving content
			    would be recomposited every frame. */}
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[6%] bg-gradient-to-r from-background to-transparent"
			/>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[6%] bg-gradient-to-l from-background to-transparent"
			/>
			<div
				data-marquee-track
				className={`flex w-max gap-6 py-4 ${
					direction === "left"
						? "motion-safe:[animation:testimonial-marquee_var(--marquee-duration)_linear_infinite]"
						: "motion-safe:[animation:testimonial-marquee-reverse_var(--marquee-duration)_linear_infinite]"
				} hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]`}
			>
				{cards.map((testimonial, i) => (
					<OpinionCard
						// biome-ignore lint/suspicious/noArrayIndexKey: the lane repeats the same comment on purpose, so the id alone is not unique
						key={`${testimonial.comment_id}-${i}`}
						testimonial={testimonial}
						dateLocale={dateLocale}
						noCountry={noCountry}
						repeat={i >= items.length}
					/>
				))}
			</div>
		</div>
	);
};
