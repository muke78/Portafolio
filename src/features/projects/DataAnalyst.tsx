import { ItemDataProjects } from "@/features/projects/items/ItemDataProjects";
import type { PropsLangWithData } from "@/types/currentLang.interface";

export const DataAnalyst = ({ currentLocale, data }: PropsLangWithData) => {
	return (
		<div className="w-full flex flex-col anim-zoom-in">
			<ItemDataProjects currentLocale={currentLocale} data={data} />
		</div>
	);
};
