import { ItemDataProjects } from "@/features/projects/items/ItemDataProjects";
import { getI18N } from "@/i18n";
import type { PropsLangWithData } from "@/types/currentLang.interface";

export const DataAnalyst = ({ currentLocale, data }: PropsLangWithData) => {
	const i18n = getI18N({ currentLocale });
	return (
		<div className="w-full flex flex-col ">
			<span className="font-bold text-5xl">
				{i18n.PROJECTS.PROJECTS_TITLE_BUTTON_D}
			</span>

			<div>
				<div className="flex flex-col gap-4 pt-4 anim-zoom-in">
					<ItemDataProjects currentLocale={currentLocale} data={data} />
				</div>
			</div>
		</div>
	);
};
