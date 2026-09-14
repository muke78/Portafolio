import { useCallback, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { PropsLang, Skill } from "@/types/currentLang.interface";

// Fase 5b: antes leia src/data/locales/*/dataTabsAcercaDe*.ts (estatico) -
// ahora hace fetch a /api/skills (Backend_Portafolio,
// docs/06-about-education-skills.md), mismo patron que
// ItemDataExperiencia.tsx. Todas las categorias se muestran siempre (sin
// acordeon) - con tantos iconos, la densidad se controla achicando cada
// chip en vez de esconder contenido detras de un click.
export const ItemDataHabilidades = ({ currentLocale }: PropsLang) => {
	const [skills, setSkills] = useState<Skill[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

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
			{skills.map(({ skill_id, title, images_topics }) => (
				<div
					key={skill_id}
					className="py-5 border-b border-border last:border-b-0"
				>
					<div className="flex items-baseline gap-2 mb-4">
						<span className="text-base font-medium">{title}</span>
						<span className="text-xs font-mono text-muted-foreground">
							{images_topics.length}
						</span>
					</div>
					<div className="flex flex-wrap gap-3">
						{images_topics.map((tech) => (
							<div
								key={tech}
								title={tech}
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
				</div>
			))}
		</div>
	);
};
