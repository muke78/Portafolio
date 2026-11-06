import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonProjectsCard } from "@/features/projects/items/SkeletonProjectsCard";
import {
	categoryAnchor,
	ProjectCategory,
} from "@/features/projects/ProjectCategory";
import { getI18N } from "@/i18n";
import { groupByCategory } from "@/lib/projectsOrder";
import { loadProjects } from "@/lib/projectsStore";
import { cn } from "@/lib/utils";
import type { Projects, PropsLang } from "@/types/currentLang.interface";

/**
 * Catalogo de proyectos: una isla, una peticion. Un indice de categorias con su conteo
 * (anclas a cada seccion) y, debajo, cada categoria con TODOS sus proyectos (ver
 * `ProjectCategory`). Sin riel fijado ni parallax: una pagina con decenas de tarjetas
 * tiene que ser ligera en el movil, y el contenido se recorre con el scroll normal.
 *
 * Los datos se piden desde el navegador cuando la isla esta cerca (`client:visible`),
 * con la peticion compartida de projectsStore; hasta entonces se ve un esqueleto de la
 * misma forma. En el servidor SIEMPRE se pinta algo: Astro hidrata `client:visible`
 * observando los hijos de la isla, y una isla vacia nunca se hidrata.
 */
export const ProjectsCatalog = ({ currentLocale }: PropsLang) => {
	const i18n = getI18N({ currentLocale });
	const [all, setAll] = useState<Projects[] | null>(null);

	useEffect(() => {
		let alive = true;
		loadProjects(currentLocale).then((rows) => {
			if (alive) setAll(rows);
		});
		return () => {
			alive = false;
		};
	}, [currentLocale]);

	const labels: Record<string, string> = {
		frontend: i18n.PROJECTS.PROJECTS_TITLE_BUTTON_F,
		backend: i18n.PROJECTS.PROJECTS_TITLE_BUTTON_B,
		companies: i18n.PROJECTS.PROJECTS_TITLE_BUTTON_C,
		dataAnalyst: i18n.PROJECTS.PROJECTS_TITLE_BUTTON_D,
	};

	if (all === null) {
		return (
			<output
				aria-busy="true"
				className="flex flex-col gap-8"
				data-testid="projects-loading"
			>
				<span className="sr-only">{i18n.COMMON.LOADING}</span>
				<Skeleton className="h-9 w-48" />
				<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{[0, 1, 2].map((i) => (
						<SkeletonProjectsCard key={i} />
					))}
				</div>
			</output>
		);
	}

	const sections = groupByCategory(all);

	if (sections.length === 0) {
		return (
			<p className="text-muted-foreground">{i18n.PROJECTS.PROJECTS_EMPTY}</p>
		);
	}

	return (
		<div className="flex flex-col gap-16 lg:gap-24">
			{sections.length > 1 && (
				<nav aria-label={i18n.PROJECTS.PROJECTS_NAV_LABEL}>
					<ul className="flex flex-wrap gap-2">
						{sections.map(({ category, projects }) => (
							<li key={category}>
								<a
									href={`#${categoryAnchor(category)}`}
									className={cn(
										buttonVariants({ variant: "outline" }),
										"h-auto min-h-11 gap-2 rounded-full px-4 py-2 hover-press",
									)}
								>
									{labels[category]}
									<span className="eyebrow">{projects.length}</span>
								</a>
							</li>
						))}
					</ul>
				</nav>
			)}

			{sections.map(({ category, projects }) => (
				<ProjectCategory
					key={category}
					currentLocale={currentLocale}
					category={category}
					label={labels[category]}
					projects={projects}
				/>
			))}
		</div>
	);
};
