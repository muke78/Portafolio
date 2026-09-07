import { Github, Globe } from "lucide-react";
import { useCallback, useState } from "react";
import { getI18N } from "@/i18n";
import type { PropsLangWithData } from "@/types/currentLang.interface";

export const ItemDataProjects = ({
	currentLocale,
	data,
}: PropsLangWithData) => {
	const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
	const i18n = getI18N({ currentLocale });

	const handleImageLoad = useCallback((tech: string) => {
		setLoadedImages((prev) => ({ ...prev, [tech]: true }));
	}, []);

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{data?.map(
				({
					project_id,
					slug,
					card_image,
					images_topics,
					link_repo,
					link_web,
					title,
					description,
					fork,
				}) => (
					<div
						key={project_id}
						className="flex flex-col rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:bg-gradient-to-tr from-secondary/30 via-secondary/5 to-transparent hover:shadow-2xl hover:brightness-105 hover:-translate-y-2 hover:scale-[1.02] transition-all duration-500 ease-in-out"
					>
						<figure className="relative overflow-hidden group cursor-pointer">
							<img
								src={`https://pub-a3fda08feb4f417fa5634c34e7959461.r2.dev/${card_image}`}
								alt={slug}
								className={`transition-transform duration-300 ease-in-out group-hover:scale-[1.03] ${
									loadedImages[card_image]
										? "opacity-100"
										: "opacity-0 absolute"
								}`}
								style={{
									width: "100%",
									height: "200px",
									objectFit: "cover",
								}}
								onLoad={() => handleImageLoad(card_image)}
								loading="lazy"
								decoding="async"
								draggable="false"
							/>

							<div className="absolute right-12 top-2 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
								<a
									href={link_repo}
									target="_blank"
									rel="noopener noreferrer"
									className={`inline-flex items-center justify-center rounded-lg bg-background/80 backdrop-blur px-2 py-1.5 transition-colors ${
										!link_repo
											? "pointer-events-none opacity-40"
											: "hover:bg-secondary hover:text-secondary-foreground"
									}`}
									aria-label={slug}
								>
									<Github size={18} />
								</a>
							</div>

							<div className="absolute right-0 top-2 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
								<a
									href={link_web}
									target="_blank"
									rel="noopener noreferrer"
									className={`inline-flex items-center justify-center rounded-lg bg-background/80 backdrop-blur px-2 py-1.5 transition-colors ${
										!link_web
											? "pointer-events-none opacity-40"
											: "hover:bg-secondary hover:text-secondary-foreground"
									}`}
									aria-label={slug}
								>
									<Globe size={18} />
								</a>
							</div>
						</figure>
						<div className="flex flex-col gap-2 p-4">
							<h2 className="flex items-center gap-2 text-2xl font-semibold">
								{title}
								{fork && (
									<span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
										{i18n.PROJECTS.PROJECTS_BADGE_FORK}
									</span>
								)}
							</h2>
							<p>{description}</p>

							<div className="flex flex-wrap items-center justify-start">
								<div className="flex -space-x-2 py-3">
									{images_topics.map((topic) => (
										<div
											className="rounded-full border-2 border-card overflow-hidden hover:-translate-y-3 transition-transform duration-500 ease-in-out"
											key={topic}
										>
											<div className="w-9 h-9 rounded-full overflow-hidden">
												<img
													className={`leading-6 transition-opacity duration-500 ease-in-out ${
														loadedImages[topic]
															? "opacity-100"
															: "opacity-0 absolute"
													}`}
													src={`https://go-skill-icons.vercel.app/api/icons?i=${topic}`}
													alt={topic}
													onLoad={() => handleImageLoad(topic)}
													loading="lazy"
													decoding="async"
													draggable="false"
												/>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				),
			)}
		</div>
	);
};
