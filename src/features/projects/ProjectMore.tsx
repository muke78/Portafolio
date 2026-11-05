import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { ItemDataProjects } from "@/features/projects/items/ItemDataProjects";
import { getI18N } from "@/i18n";
import {
	fill,
	orderProjects,
	PAGE_SIZE,
	RAIL_LIMIT,
} from "@/lib/projectsOrder";
import { loadProjects } from "@/lib/projectsStore";
import { cn } from "@/lib/utils";
import type { Projects, PropsLang } from "@/types/currentLang.interface";

interface ProjectMoreProps extends PropsLang {
	category: Projects["category"];
}

const pill = "h-auto min-h-11 gap-2 rounded-full px-5 py-3";

/**
 * El resto de una categoria: lo que no cabe en el riel fijado. Aparece justo debajo del
 * riel como un boton ("Ver 8 mas de Frontend") que abre una cuadricula normal, de a
 * `PAGE_SIZE`, sin fijar nada ni mover la pagina. Si la categoria cabe en el riel, no
 * pinta nada.
 *
 * Va FUERA del contenedor fijado (`[data-hscroll]`): si creciera dentro, el pin cambiaria
 * de altura mientras se usa. Comparte la peticion con el riel (projectsStore).
 */
export const ProjectMore = ({ currentLocale, category }: ProjectMoreProps) => {
	const i18n = getI18N({ currentLocale });
	const [all, setAll] = useState<Projects[] | null>(null);
	const [open, setOpen] = useState(false);
	const [shown, setShown] = useState(PAGE_SIZE);
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

	const labels: Record<string, string> = {
		frontend: i18n.PROJECTS.PROJECTS_TITLE_BUTTON_F,
		backend: i18n.PROJECTS.PROJECTS_TITLE_BUTTON_B,
		companies: i18n.PROJECTS.PROJECTS_TITLE_BUTTON_C,
		dataAnalyst: i18n.PROJECTS.PROJECTS_TITLE_BUTTON_D,
	};

	const rest = orderProjects(
		(all ?? []).filter((p) => p.category === category),
	).slice(RAIL_LIMIT);
	if (rest.length === 0) return null;

	const visible = rest.slice(0, shown);
	const pending = rest.length - visible.length;

	return (
		<div className="mt-10 flex flex-col gap-8">
			<div className="flex">
				<button
					type="button"
					aria-expanded={open}
					aria-controls={regionId}
					onClick={() => {
						setOpen((now) => !now);
						setShown(PAGE_SIZE);
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
				{open ? (
					<div className="flex flex-col gap-8">
						<ItemDataProjects
							currentLocale={currentLocale}
							data={visible}
							layout="grid"
						/>
						{pending > 0 ? (
							<div className="flex">
								<button
									type="button"
									onClick={() => setShown((n) => n + PAGE_SIZE)}
									className={cn(buttonVariants({ variant: "ghost" }), pill)}
								>
									{fill(i18n.PROJECTS.PROJECTS_LOAD_MORE, {
										n: Math.min(PAGE_SIZE, pending),
									})}
								</button>
							</div>
						) : null}
					</div>
				) : null}
			</div>
		</div>
	);
};
