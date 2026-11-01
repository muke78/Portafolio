import { ItemDataProjects } from "@/features/projects/items/ItemDataProjects";
import type { PropsLangWithData } from "@/types/currentLang.interface";

export const Backend = ({ currentLocale, data }: PropsLangWithData) => {
	return (
		<div className="w-full flex flex-col">
			<ItemDataProjects currentLocale={currentLocale} data={data} />
		</div>
	);
};
