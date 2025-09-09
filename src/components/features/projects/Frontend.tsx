import { ItemDataProjects } from "@/components/features/projects/items/ItemDataProjects";
import { getI18N } from "@/i18n";
import type { PropsLangWithData } from "@/interfaces/currentLang.interface";

export const Frontend = ({ currentLocale, data }: PropsLangWithData) => {
	const i18n = getI18N({ currentLocale });
	return (
		<div className="w-full flex flex-col ">
			<span className="font-bold text-5xl">
				{i18n.PROJECTS.PROJECTS_TITLE_BUTTON_F}
			</span>
			<div>
				<div className="flex flex-col hero-content gap-4 pt-4 animate__animated animate__zoomIn">
					<ItemDataProjects currentLocale={currentLocale} data={data} />
				</div>
			</div>
		</div>
	);
};
