import { ArrowUpRight } from "lucide-react";
import { useCallback, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getI18N } from "@/i18n";
import type { PropsLangWithData } from "@/types/currentLang.interface";

const R2 = "https://pub-a3fda08feb4f417fa5634c34e7959461.r2.dev";

export const ItemDataProjects = ({
	currentLocale,
	data,
}: PropsLangWithData) => {
	const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
	const i18n = getI18N({ currentLocale });

	const handleImageLoad = useCallback((key: string) => {
		setLoadedImages((prev) => ({ ...prev, [key]: true }));
	}, []);

	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2" data-reveal-group>
			{data?.map(
				({
					project_id,
					slug,
					card_image,
					images_topics,
					title,
					description,
					fork,
				}) => (
					<article
						key={project_id}
						data-reveal
						className="relative flex flex-col overflow-hidden rounded-xl border border-border bg-card hover-lift"
					>
						<figure className="relative h-[200px] overflow-hidden bg-muted">
							{!loadedImages[card_image] && (
								<Skeleton className="absolute inset-0 rounded-none" />
							)}
							<img
								src={`${R2}/${card_image}`}
								alt=""
								width={400}
								height={200}
								className={`h-full w-full object-cover transition-opacity duration-500 ${
									loadedImages[card_image] ? "opacity-100" : "opacity-0"
								}`}
								onLoad={() => handleImageLoad(card_image)}
								loading="lazy"
								decoding="async"
								draggable="false"
							/>
						</figure>
						<div className="flex flex-1 flex-col gap-2 p-4">
							<h3 className="flex flex-wrap items-center gap-x-2 gap-y-1 text-2xl font-semibold">
								{/* The whole card is the click target: this link stretches over it. */}
								<a
									href={`/${currentLocale}/project/${slug}`}
									className="inline-flex items-center gap-1 rounded-sm after:absolute after:inset-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
								>
									{title}
									<ArrowUpRight
										size={20}
										aria-hidden="true"
										className="text-muted-foreground"
									/>
								</a>
								{fork && (
									<span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
										{i18n.PROJECTS.PROJECTS_BADGE_FORK}
									</span>
								)}
							</h3>
							<p>{description}</p>

							<div className="mt-auto flex -space-x-2 pt-3">
								{images_topics.map((topic) => (
									<div
										className="h-9 w-9 overflow-hidden rounded-full border-2 border-card"
										key={topic}
									>
										<img
											className={`h-full w-full transition-opacity duration-500 ${
												loadedImages[topic] ? "opacity-100" : "opacity-0"
											}`}
											src={`https://go-skill-icons.vercel.app/api/icons?i=${topic}`}
											alt={topic}
											onLoad={() => handleImageLoad(topic)}
											loading="lazy"
											decoding="async"
											draggable="false"
										/>
									</div>
								))}
							</div>
						</div>
					</article>
				),
			)}
		</div>
	);
};
