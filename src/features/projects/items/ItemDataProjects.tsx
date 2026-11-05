import { ArrowUpRight } from "lucide-react";
import { useCallback, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getI18N } from "@/i18n";
import { mediaUrl } from "@/lib/media";
import { techIconUrl } from "@/lib/techIcon";
import type { PropsLangWithData } from "@/types/currentLang.interface";

/**
 * Project card - reading hierarchy (UI_STANDARDS 5.3):
 *   1. Title ........ serif, the dominant element (text-heading)
 *   2. Category ..... small label above it (eyebrow) + collaboration badge
 *   3. Description .. muted body, 3 lines max
 *   4. Stack ........ round icons, overlapped, after a hairline
 * Space inside a group (title/category, title/description) is always smaller
 * than the space between groups (description/stack): proximity.
 */
export const ItemDataProjects = ({
	currentLocale,
	data,
	layout = "rail",
}: PropsLangWithData) => {
	const grid = layout === "grid";
	const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
	const i18n = getI18N({ currentLocale });

	const categoryLabels: Record<string, string> = {
		frontend: i18n.PROJECTS.PROJECTS_TITLE_BUTTON_F,
		backend: i18n.PROJECTS.PROJECTS_TITLE_BUTTON_B,
		companies: i18n.PROJECTS.PROJECTS_TITLE_BUTTON_C,
		dataAnalyst: i18n.PROJECTS.PROJECTS_TITLE_BUTTON_D,
	};

	const handleImageLoad = useCallback((key: string) => {
		setLoadedImages((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
	}, []);

	// The browser may finish a download before React attaches onLoad (images
	// are eager here, inside a clipped rail): check the element when it mounts.
	const markIfLoaded = (el: HTMLImageElement | null, key: string) => {
		if (el?.complete && el.naturalWidth > 0) handleImageLoad(key);
	};

	return (
		<div
			data-hscroll-track={grid ? undefined : ""}
			className={
				grid
					? "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
					: "flex w-max items-stretch gap-4 pr-6 lg:gap-5"
			}
		>
			{data?.map(
				({
					project_id,
					slug,
					category,
					card_image,
					images_topics,
					title,
					summary,
					description,
					fork,
					featured,
				}) => {
					return (
						<article
							key={project_id}
							data-reveal
							className={`relative flex flex-col overflow-hidden rounded-xl border border-border bg-card hover-lift ${
								grid
									? "w-full"
									: "w-[82vw] max-w-[400px] shrink-0 snap-start lg:w-[400px]"
							}`}
						>
							<figure
								data-mask
								data-mask-delay="0.1"
								className="relative h-[200px] overflow-hidden bg-muted"
							>
								{!loadedImages[card_image] && (
									<Skeleton className="absolute inset-0 rounded-none" />
								)}
								<img
									src={mediaUrl(card_image)}
									alt=""
									width={400}
									height={200}
									data-parallax-img
									className={`absolute inset-x-0 -top-[12%] h-[124%] w-full object-cover transition-opacity duration-500 ${
										loadedImages[card_image] ? "opacity-100" : "opacity-0"
									}`}
									ref={(el) => markIfLoaded(el, card_image)}
									onLoad={() => handleImageLoad(card_image)}
									loading={grid ? "lazy" : "eager"}
									decoding="async"
									draggable="false"
								/>
							</figure>

							<div className="flex flex-1 flex-col p-6">
								{/* 2 - category (+ collaboration) */}
								<p className="eyebrow flex flex-wrap items-center gap-x-3 gap-y-1">
									{categoryLabels[category]}
									{featured && (
										<span className="inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
											{i18n.PROJECTS.PROJECTS_BADGE_FEATURED}
										</span>
									)}
									{fork && (
										<span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs font-medium text-foreground">
											{i18n.PROJECTS.PROJECTS_BADGE_FORK}
										</span>
									)}
								</p>

								{/* 1 - title: the whole card is the click target */}
								<h3 className="font-serif-display text-heading mt-2">
									<a
										href={`/${currentLocale}/project/${slug}`}
										className="inline-flex items-start gap-1.5 rounded-sm after:absolute after:inset-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
									>
										{title}
										<ArrowUpRight
											size={20}
											aria-hidden="true"
											className="mt-1 shrink-0 text-muted-foreground"
										/>
									</a>
								</h3>

								{/* 3 - description */}
								<p className="mt-3 line-clamp-3 text-base leading-relaxed text-muted-foreground">
									{summary || description}
								</p>

								{/* 4 - stack: round icons, overlapped */}
								<ul
									className="mt-auto flex -space-x-2 border-t border-border pt-5"
									aria-label={i18n.PROJECT_DETAIL.STACK}
								>
									{images_topics.map((topic) => (
										<li
											key={topic}
											title={topic}
											className="h-9 w-9 overflow-hidden rounded-full border-2 border-card bg-muted"
										>
											<img
												className={`h-full w-full transition-opacity duration-500 ${
													loadedImages[topic] ? "opacity-100" : "opacity-0"
												}`}
												src={techIconUrl(topic)}
												alt={topic}
												ref={(el) => markIfLoaded(el, topic)}
												onLoad={() => handleImageLoad(topic)}
												loading={grid ? "lazy" : "eager"}
												decoding="async"
												draggable="false"
											/>
										</li>
									))}
								</ul>
							</div>
						</article>
					);
				},
			)}
		</div>
	);
};
