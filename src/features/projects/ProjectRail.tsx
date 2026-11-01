import { useEffect, useState } from "react";
import { ItemDataProjects } from "@/features/projects/items/ItemDataProjects";
import { SkeletonProjectsCard } from "@/features/projects/items/SkeletonProjectsCard";
import { getI18N } from "@/i18n";
import { loadProjects } from "@/lib/projectsStore";
import type { Projects, PropsLang } from "@/types/currentLang.interface";

interface ProjectRailProps extends PropsLang {
	category: Projects["category"];
}

/**
 * One category of projects as a sideways rail. There are no tabs: every
 * category has its own rail, one after another down the page. On desktop the
 * engine pins the rail and the scroll slides the cards (see layers.ts); on
 * small screens it is a native swipeable row with snap.
 *
 * Data is fetched on the client, only once the island is close to the
 * viewport (client:visible), through one shared request (projectsStore).
 * The rail takes however many cards the CMS returns: the scroll distance is
 * measured from the DOM, never assumed.
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
	const data = all?.filter((p) => p.category === category) ?? [];

	return (
		<div className="flex flex-col gap-8 lg:gap-10">
			<div className="flex items-baseline justify-between gap-6">
				<h3 className="font-serif-display text-subtitle" data-split>
					{labels[category]}
				</h3>
				{all && (
					<p className="text-sm text-muted-foreground">
						{data.length} {i18n.PROJECTS.PROJECTS_COUNT_LABEL}
					</p>
				)}
			</div>

			{/* Vertical padding (and the matching negative margin) leaves room for
			    the card's lift and glow: overflow-x clips on y as well. */}
			<div
				data-hscroll-viewport
				className="-mx-6 -my-8 min-w-0 snap-x snap-mandatory overflow-x-auto px-6 py-8"
			>
				{all === null ? (
					<output
						aria-busy="true"
						className="flex w-max items-stretch gap-4 pr-6 lg:gap-5"
						data-hscroll-track
					>
						<span className="sr-only">{i18n.COMMON.LOADING}</span>
						{[0, 1, 2].map((i) => (
							<div
								key={i}
								className="flex w-[82vw] max-w-[400px] shrink-0 lg:w-[400px]"
							>
								<SkeletonProjectsCard />
							</div>
						))}
					</output>
				) : data.length === 0 ? (
					<p className="text-muted-foreground">
						{i18n.PROJECTS.PROJECTS_EMPTY}
					</p>
				) : (
					<ItemDataProjects currentLocale={currentLocale} data={data} />
				)}
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
