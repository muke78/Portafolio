import { useCallback, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getI18N } from "@/i18n";
import type { PropsLang, Skill } from "@/types/currentLang.interface";

// Fase 5b: antes leia src/data/locales/*/dataTabsAcercaDe*.ts (estatico) -
// ahora hace fetch a /api/skills (Backend_Portafolio,
// docs/06-about-education-skills.md), mismo patron que
// ItemDataExperiencia.tsx.
//
// Ley de Hick (UI_STANDARDS 2.1): cada categoria muestra solo sus TOP
// primeras tecnologias; el resto se revela con un clic limpio ("Ver todas"),
// en lugar de volcar decenas de chips a la vez.
const TOP_SKILLS = 8;

export const ItemDataHabilidades = ({ currentLocale }: PropsLang) => {
	const [skills, setSkills] = useState<Skill[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [expanded, setExpanded] = useState<Record<number, boolean>>({});
	const i18n = getI18N({ currentLocale });

	const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

	const handleImageLoad = useCallback((tech: string) => {
		setLoadedImages((prev) => ({ ...prev, [tech]: true }));
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
			<div className="col-span-full flex flex-col gap-4">
				{[0, 1, 2].map((i) => (
					<Skeleton key={i} className="h-24 w-full rounded-lg" />
				))}
			</div>
		);
	}

	return (
		<div className="col-span-full flex flex-col">
			{skills.map(({ skill_id, title, images_topics }) => {
				const isOpen = expanded[skill_id] ?? false;
				const hidden = Math.max(0, images_topics.length - TOP_SKILLS);
				const visible = isOpen
					? images_topics
					: images_topics.slice(0, TOP_SKILLS);
				return (
					<div
						key={skill_id}
						data-reveal
						className="py-6 border-b border-border last:border-b-0"
					>
						<div className="flex items-baseline gap-2 mb-4">
							<span className="text-base font-medium">{title}</span>
							<span className="text-xs font-mono text-muted-foreground">
								{images_topics.length}
							</span>
						</div>
						<div
							className="flex flex-wrap gap-3"
							data-stagger
							data-stagger-delay="0.15"
						>
							{visible.map((tech, i) => (
								<div
									key={tech}
									title={tech}
									// Only the chips present at first render stagger in; the ones
									// added by "see all" mount later and must stay visible.
									{...(i < TOP_SKILLS && !isOpen
										? { "data-stagger-item": "" }
										: {})}
									className="flex items-center gap-2 rounded-full border border-border bg-muted/50 pl-2 pr-4 py-2"
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
											onLoad={() => handleImageLoad(tech)}
											loading="lazy"
											decoding="async"
											draggable="false"
											width={28}
											height={28}
										/>
									</span>
									<span className="text-sm text-muted-foreground whitespace-nowrap">
										{tech}
									</span>
								</div>
							))}
						</div>
						{hidden > 0 && (
							<button
								type="button"
								aria-expanded={isOpen}
								onClick={() =>
									setExpanded((prev) => ({ ...prev, [skill_id]: !isOpen }))
								}
								className="mt-4 inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm text-muted-foreground hover-press hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
							>
								{isOpen
									? i18n.SKILLS.SKILLS_LESS
									: `${i18n.SKILLS.SKILLS_MORE} (+${hidden})`}
							</button>
						)}
					</div>
				);
			})}
		</div>
	);
};
