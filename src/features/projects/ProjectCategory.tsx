import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { ProjectCard } from "@/features/projects/ProjectCard";
import { getI18N } from "@/i18n";
import { fill, INITIAL_VISIBLE } from "@/lib/projectsOrder";
import { cn } from "@/lib/utils";
import type { Projects, PropsLang } from "@/types/currentLang.interface";

interface ProjectCategoryProps extends PropsLang {
	category: Projects["category"];
	label: string;
	projects: readonly Projects[];
}

/** Ancla de la categoria: la usa el indice de arriba (`#proyectos-empresas`). */
export const categoryAnchor = (category: Projects["category"]) =>
	`proyectos-${category}`;

const pill = "h-auto min-h-11 gap-2 rounded-full px-5 py-3";

/**
 * Una categoria: sus primeras tarjetas en una cuadricula y, si hay mas, un boton
 * "Ver N mas de X" que abre TODAS las demas de una vez (sin paginas ni tope).
 *
 * Vive en el flujo normal de la pagina: nada fijado ni trasladado, asi crece sin
 * tocar el scroll de lo que hay debajo. El boton es un `<button>` con `aria-expanded`
 * y `aria-controls`; al abrir, el foco pasa a la primera tarjeta nueva y al cerrar vuelve
 * al boton, y una region `status` anuncia cuantas se ven.
 */
export const ProjectCategory = ({
	currentLocale,
	category,
	label,
	projects,
}: ProjectCategoryProps) => {
	const i18n = getI18N({ currentLocale });
	const [expanded, setExpanded] = useState(false);
	const list = useRef<HTMLUListElement>(null);
	const toggle = useRef<HTMLButtonElement>(null);
	const moved = useRef(false);
	const listId = useId();
	const headingId = useId();

	const total = projects.length;
	const hidden = Math.max(0, total - INITIAL_VISIBLE);
	const visible = expanded ? projects : projects.slice(0, INITIAL_VISIBLE);

	// El foco solo se mueve tras una accion de la persona, nunca al montar.
	useEffect(() => {
		if (!moved.current) return;
		if (expanded) {
			list.current
				?.querySelectorAll<HTMLAnchorElement>("li a")
				[INITIAL_VISIBLE]?.focus();
		} else {
			toggle.current?.focus();
		}
	}, [expanded]);

	const count = fill(i18n.PROJECTS.PROJECTS_SHOWING, {
		shown: visible.length,
		total,
	});

	return (
		<section
			id={categoryAnchor(category)}
			aria-labelledby={headingId}
			className="scroll-mt-24"
		>
			<div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
				<h3 id={headingId} className="font-serif-display text-subtitle">
					{label}
				</h3>
				<p className="text-sm text-muted-foreground">{count}</p>
			</div>

			<ul
				ref={list}
				id={listId}
				className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
			>
				{visible.map((project, index) => (
					<li
						key={project.project_id}
						// Solo las primeras entran con fade-up; las que abre el boton salen ya
						// visibles (mas ligero y sin esperar a que el motor las vea).
						{...(index < INITIAL_VISIBLE ? { "data-reveal": "" } : {})}
					>
						<ProjectCard
							currentLocale={currentLocale}
							project={project}
							categoryLabel={label}
						/>
					</li>
				))}
			</ul>

			{hidden > 0 && (
				<div className="mt-8 flex">
					<button
						ref={toggle}
						type="button"
						aria-expanded={expanded}
						aria-controls={listId}
						onClick={() => {
							moved.current = true;
							setExpanded((now) => !now);
						}}
						className={cn(buttonVariants({ variant: "outline" }), pill)}
					>
						{expanded
							? i18n.PROJECTS.PROJECTS_SHOW_LESS
							: fill(i18n.PROJECTS.PROJECTS_SHOW_MORE, {
									n: hidden,
									category: label,
								})}
						{expanded ? (
							<ChevronUp size={18} aria-hidden="true" />
						) : (
							<ChevronDown size={18} aria-hidden="true" />
						)}
					</button>
				</div>
			)}

			<output className="sr-only">{moved.current ? count : ""}</output>
		</section>
	);
};
