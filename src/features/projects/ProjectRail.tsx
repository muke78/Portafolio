import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectCard } from "@/features/projects/ProjectCard";
import { getI18N } from "@/i18n";
import { fill, orderProjects, RAIL_LIMIT } from "@/lib/projectsOrder";
import { loadProjects } from "@/lib/projectsStore";
import type { Projects, PropsLang } from "@/types/currentLang.interface";

interface ProjectRailProps extends PropsLang {
	category: Projects["category"];
}

/** Ancho de cada tarjeta: grande, para que la imagen se vea. En telefono, casi toda la pantalla. */
const CARD_WIDTH = "auto-cols-[min(84vw,460px)]";

/**
 * Las mejores tarjetas de UNA categoria como una escena horizontal: los destacados
 * primero, en una sola fila y de una en una (el motor fija la escena y el scroll desliza
 * la tira, ver `lib/motion/rails.ts`). Son a lo mas `RAIL_LIMIT`: darle al lector
 * decenas de proyectos de golpe no es una buena entrada. El resto vive en `ProjectMore`,
 * justo debajo, detras de un boton («Ver 9 mas de Empresas»).
 *
 * El nodo que se fija es el contenedor `[data-hscroll]` que pinta Astro
 * (Proyectos.astro); aqui solo se pinta lo que va dentro, y el motor solo traslada la
 * tira. Los datos se piden desde el navegador cuando la isla esta cerca
 * (`client:visible`) con la peticion compartida de projectsStore. En el servidor SIEMPRE
 * se pinta algo (titulo y esqueleto): Astro hidrata `client:visible` observando los hijos
 * de la isla, y una isla vacia nunca se hidrata.
 */
export const ProjectRail = ({ currentLocale, category }: ProjectRailProps) => {
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
	const label = labels[category];
	const ordered = orderProjects(
		all?.filter((p) => p.category === category) ?? [],
	);
	const data = ordered.slice(0, RAIL_LIMIT);

	return (
		<section
			id={`proyectos-${category}`}
			aria-labelledby={`proyectos-${category}-titulo`}
			className="flex flex-col gap-6 lg:gap-8"
		>
			<div>
				<h3
					id={`proyectos-${category}-titulo`}
					className="font-serif-display text-subtitle"
					data-split
				>
					{label}
				</h3>
				{all && ordered.length > 0 && (
					<p className="mt-1 text-sm text-muted-foreground">
						{fill(i18n.PROJECTS.PROJECTS_SHOWING, {
							shown: data.length,
							total: ordered.length,
						})}
					</p>
				)}
			</div>

			{/* Vertical padding (and the matching negative margin) leaves room for
			    the card's lift and glow: overflow clips on y as well. */}
			<div
				data-hscroll-viewport
				className="-mx-6 -my-6 min-w-0 snap-x snap-mandatory overflow-x-auto px-6 py-6"
			>
				{all === null ? (
					<output
						aria-busy="true"
						className="flex w-max items-stretch gap-5 pr-6 lg:gap-6"
						data-hscroll-track
					>
						<span className="sr-only">{i18n.COMMON.LOADING}</span>
						{[0, 1, 2].map((i) => (
							<Skeleton
								key={i}
								className="h-[480px] w-[84vw] max-w-[460px] shrink-0 rounded-xl"
							/>
						))}
					</output>
				) : data.length === 0 ? (
					<p className="text-muted-foreground">
						{i18n.PROJECTS.PROJECTS_EMPTY}
					</p>
				) : (
					<ul
						data-hscroll-track
						className={`relative grid w-max grid-flow-col grid-rows-1 gap-5 pr-6 lg:gap-6 ${CARD_WIDTH}`}
					>
						{data.map((project) => (
							<li
								key={project.project_id}
								data-rail-card
								className="snap-start"
							>
								<ProjectCard
									currentLocale={currentLocale}
									project={project}
									categoryLabel={label}
								/>
							</li>
						))}
					</ul>
				)}
			</div>

			{data.length > 1 && (
				<div className="flex items-center gap-4" aria-hidden="true">
					<p className="eyebrow tabular-nums">
						<span data-hscroll-current>1</span> / {data.length}
					</p>
					<div className="h-px flex-1 bg-border">
						<div
							data-hscroll-progress
							className="h-px origin-left bg-primary"
							style={{ transform: "scaleX(0)" }}
						/>
					</div>
				</div>
			)}
		</section>
	);
};
