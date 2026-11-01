import { useCallback, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { PropsLang, Skill } from "@/types/currentLang.interface";

// Skills are no longer hidden behind a "see all" click: every technology is on
// the page. The scroll does the storytelling instead - each chip flies in
// along a curve (MotionPathPlugin, src/lib/motion/skills.ts) and a thin
// "snake" line is drawn through the section while a dot rides it.
const SNAKE =
	"M 80 0 C 80 180, 920 120, 920 420 S 80 700, 80 1000 S 920 1300, 920 1600 S 80 1900, 500 2000";

export const ItemDataHabilidades = ({ currentLocale }: PropsLang) => {
	const [skills, setSkills] = useState<Skill[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

	const handleImageLoad = useCallback((tech: string) => {
		setLoadedImages((prev) => (prev[tech] ? prev : { ...prev, [tech]: true }));
	}, []);

	useEffect(() => {
		async function fetchData() {
			try {
				const result = await fetch(
					`/api/skills?currentLocale=${currentLocale}`,
				);
				const body = await result.json();
				setSkills(body.data);
			} catch (error) {
				console.error("Error cargando habilidades:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchData();
	}, [currentLocale]);

	if (loading) {
		return (
			<div className="flex flex-col gap-4">
				{[0, 1, 2].map((i) => (
					<Skeleton key={i} className="h-24 w-full rounded-lg" />
				))}
			</div>
		);
	}

	return (
		<div className="relative isolate" data-skills>
			{/* The snake: decorative, desktop only. */}
			<svg
				data-snake
				aria-hidden="true"
				viewBox="0 0 1000 2000"
				preserveAspectRatio="none"
				className="pointer-events-none absolute inset-0 -z-10 hidden h-full w-full md:block"
			>
				<path d={SNAKE} fill="none" stroke="var(--border)" strokeWidth="2" />
				<path
					data-snake-trace
					pathLength={1}
					d={SNAKE}
					fill="none"
					stroke="var(--primary)"
					strokeWidth="2"
					strokeLinecap="round"
				/>
			</svg>
			<span
				data-snake-dot
				aria-hidden="true"
				className="pointer-events-none absolute left-0 top-0 hidden h-4 w-4 rounded-full bg-primary shadow-[var(--glow)] md:block"
			/>

			<div className="flex flex-col gap-14 md:gap-20">
				{skills.map(({ skill_id, title, images_topics }) => (
					<section key={skill_id} aria-label={title}>
						<div className="mb-6 flex items-baseline gap-3">
							<h3 className="font-serif-display text-heading">{title}</h3>
							<span className="text-sm text-muted-foreground">
								{images_topics.length}
							</span>
						</div>
						<ul className="flex flex-wrap gap-3" data-fly-group>
							{images_topics.map((tech) => (
								// The <li> is the one the scroll moves along its curve; the pill
								// inside is the one that drifts on its own once it has arrived.
								<li key={tech} title={tech} data-fly-chip>
									<div
										data-fly-body
										className="flex items-center gap-2 rounded-full border border-border bg-card py-2 pl-2 pr-4"
									>
										<span className="relative flex h-7 w-7 shrink-0 items-center justify-center">
											{!loadedImages[tech] && (
												<Skeleton className="absolute inset-0 rounded-full" />
											)}
											<img
												className={`h-7 w-7 rounded-full object-contain transition-opacity duration-200 ${
													loadedImages[tech] ? "opacity-100" : "opacity-0"
												}`}
												src={`https://go-skill-icons.vercel.app/api/icons?i=${tech}`}
												alt=""
												ref={(el) => {
													if (el?.complete && el.naturalWidth > 0)
														handleImageLoad(tech);
												}}
												onLoad={() => handleImageLoad(tech)}
												loading="lazy"
												decoding="async"
												draggable="false"
												width={28}
												height={28}
											/>
										</span>
										<span className="whitespace-nowrap text-sm text-muted-foreground">
											{tech}
										</span>
									</div>
								</li>
							))}
						</ul>
					</section>
				))}
			</div>
		</div>
	);
};
