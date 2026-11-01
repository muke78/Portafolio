import { ItemDataProjects } from "@/features/projects/items/ItemDataProjects";
import { getI18N } from "@/i18n";
import type { Projects, PropsLang } from "@/types/currentLang.interface";

interface ProjectRailProps extends PropsLang {
	category: Projects["category"];
	data: Projects[];
}

/**
 * One category of projects as a sideways rail. There are no tabs: every
 * category has its own rail, one after another down the page. On desktop the
 * engine pins the rail and the scroll slides the cards (see layers.ts); on
 * small screens it is a native swipeable row with snap.
 */
export const ProjectRail = ({
	currentLocale,
	category,
	data,
}: ProjectRailProps) => {
	const i18n = getI18N({ currentLocale });
	const labels: Record<string, string> = {
		frontend: i18n.PROJECTS.PROJECTS_TITLE_BUTTON_F,
		backend: i18n.PROJECTS.PROJECTS_TITLE_BUTTON_B,
		companies: i18n.PROJECTS.PROJECTS_TITLE_BUTTON_C,
		dataAnalyst: i18n.PROJECTS.PROJECTS_TITLE_BUTTON_D,
	};

	return (
		<div className="flex flex-col gap-8 lg:gap-10">
			<div className="flex items-baseline justify-between gap-6">
				<h3 className="font-serif-display text-subtitle" data-split>
					{labels[category]}
				</h3>
				<p className="text-sm text-muted-foreground">
					{data.length} {i18n.PROJECTS.PROJECTS_COUNT_LABEL}
				</p>
			</div>

			<div
				data-hscroll-viewport
				className="-mx-6 min-w-0 snap-x snap-mandatory overflow-x-auto px-6 pb-3 lg:mx-0 lg:snap-none lg:px-0 lg:pb-0"
			>
				<ItemDataProjects currentLocale={currentLocale} data={data} />
			</div>

			<div aria-hidden="true" className="hidden h-px w-full bg-border lg:block">
				<div
					data-hscroll-progress
					className="h-px origin-left bg-primary"
					style={{ transform: "scaleX(0)" }}
				/>
			</div>
		</div>
	);
};
