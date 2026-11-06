import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { ProjectRow } from "@/features/projects/ProjectRow";
import { getI18N } from "@/i18n";
import { fill, orderProjects, RAIL_LIMIT } from "@/lib/projectsOrder";
import { loadProjects } from "@/lib/projectsStore";
import { cn } from "@/lib/utils";
import type { Projects, PropsLang } from "@/types/currentLang.interface";

interface ProjectMoreProps extends PropsLang {
	category: Projects["category"];
}

const pill = "h-auto min-h-11 gap-2 rounded-full px-5 py-3";

/**
 * El resto de una categoria: lo que no cabe en el riel. Un boton («Ver 9 mas de Empresas»)
 * abre un INDICE con TODOS los demas, de una vez y sin paginas (`ProjectRow`: una fila por
 * proyecto, con una vista previa grande que sigue al cursor). Si la categoria cabe en el
 * riel, no pinta nada.
 *
 * Va FUERA del contenedor fijado (`[data-hscroll]`): si creciera dentro, el pin cambiaria
 * de altura mientras se usa. Es un `<button>` con `aria-expanded`/`aria-controls`; al abrir,
 * el foco pasa a la primera fila nueva y al cerrar vuelve al boton, y una region `status`
 * anuncia cuantos se ven (solo tras una accion).
 *
 * En el servidor SIEMPRE pinta un hijo (un marcador de 1 px): Astro hidrata
 * `client:visible` observando los hijos de la isla y una isla vacia no se hidrata nunca.
 * Esa fue la causa de que el boton «Ver N mas» no apareciera.
 */
export const ProjectMore = ({ currentLocale, category }: ProjectMoreProps) => {
	const i18n = getI18N({ currentLocale });
	const [all, setAll] = useState<Projects[] | null>(null);
	const [open, setOpen] = useState(false);
	const list = useRef<HTMLUListElement>(null);
	const toggle = useRef<HTMLButtonElement>(null);
	const moved = useRef(false);
	const regionId = useId();

	useEffect(() => {
		let alive = true;
		loadProjects(currentLocale).then((rows) => {
			if (alive) setAll(rows);
		});
		return () => {
			alive = false;
		};
	}, [currentLocale]);

	// El foco solo se mueve tras una accion de la persona, nunca al montar.
	useEffect(() => {
		if (!moved.current) return;
		if (open) list.current?.querySelector<HTMLAnchorElement>("li a")?.focus();
		else toggle.current?.focus();
	}, [open]);

	if (all === null) {
		return <div aria-hidden="true" className="h-px" />;
	}

	const labels: Record<string, string> = {
		frontend: i18n.PROJECTS.PROJECTS_TITLE_BUTTON_F,
		backend: i18n.PROJECTS.PROJECTS_TITLE_BUTTON_B,
		companies: i18n.PROJECTS.PROJECTS_TITLE_BUTTON_C,
		dataAnalyst: i18n.PROJECTS.PROJECTS_TITLE_BUTTON_D,
	};
	const rest = orderProjects(all.filter((p) => p.category === category)).slice(
		RAIL_LIMIT,
	);
	if (rest.length === 0) return null;

	const total = rest.length + RAIL_LIMIT;
	const status = fill(i18n.PROJECTS.PROJECTS_SHOWING, {
		shown: open ? total : RAIL_LIMIT,
		total,
	});

	return (
		<div className="mt-10 flex flex-col gap-8">
			<div className="flex">
				<button
					ref={toggle}
					type="button"
					aria-expanded={open}
					aria-controls={regionId}
					onClick={() => {
						moved.current = true;
						setOpen((now) => !now);
					}}
					className={cn(buttonVariants({ variant: "outline" }), pill)}
				>
					{open
						? i18n.PROJECTS.PROJECTS_SHOW_LESS
						: fill(i18n.PROJECTS.PROJECTS_SHOW_MORE, {
								n: rest.length,
								category: labels[category],
							})}
					{open ? (
						<ChevronUp size={18} aria-hidden="true" />
					) : (
						<ChevronDown size={18} aria-hidden="true" />
					)}
				</button>
			</div>

			<div id={regionId} hidden={!open}>
				{open && (
					<ul
						ref={list}
						data-peek
						className="flex flex-col border-b border-border"
					>
						{rest.map((project) => (
							<ProjectRow
								key={project.project_id}
								currentLocale={currentLocale}
								project={project}
							/>
						))}
					</ul>
				)}
			</div>

			<output className="sr-only">{moved.current ? status : ""}</output>
		</div>
	);
};
