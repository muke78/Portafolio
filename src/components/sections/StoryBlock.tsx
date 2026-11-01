import type { ReactNode } from "react";

interface StoryBlockProps {
	/** Section title: a real <h2>, split into masked lines by the engine. */
	title: string;
	/** Optional short line under the title (muted). */
	lead?: string;
	/**
	 * "split": title in a sticky 4-col column, content in 8 cols (default).
	 * "stacked": title on top, content across the full width (wide stages).
	 */
	layout?: "split" | "stacked";
	children: ReactNode;
}

/**
 * One scene of the About story. The Home has no tabs or hidden panels: every
 * block is simply there, one after another, and scrolling tells the story.
 */
export const StoryBlock = ({
	title,
	lead,
	layout = "split",
	children,
}: StoryBlockProps) => {
	const heading = (
		<>
			<h2 className="font-serif-display text-title text-balance" data-split>
				{title}
			</h2>
			{lead && (
				<p className="khelde-lead text-muted-foreground" data-reveal>
					{lead}
				</p>
			)}
		</>
	);

	if (layout === "stacked") {
		return (
			<div className="flex flex-col gap-12 lg:gap-16">
				<div className="flex max-w-3xl flex-col gap-4">{heading}</div>
				<div className="min-w-0">{children}</div>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
			<div className="lg:col-span-4">
				<div className="flex flex-col gap-4 lg:sticky lg:top-28">{heading}</div>
			</div>
			<div className="min-w-0 lg:col-span-8">{children}</div>
		</div>
	);
};
