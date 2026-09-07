import { ItemDataHabilidades } from "@/features/aboutMe/Items/ItemDataHabilidades";
import { getI18N } from "@/i18n";
import type { PropsLang } from "@/types/currentLang.interface";

export const Habilidades = ({ currentLocale }: PropsLang) => {
	const i18n = getI18N({ currentLocale });
	return (
		<div className="w-full flex flex-col">
			<span className="font-bold text-5xl mb-4">
				{i18n.SKILLS.SKILLS_TITLE}
			</span>

			<div className="anim-zoom-in p-2">
				<ItemDataHabilidades currentLocale={currentLocale} />
			</div>
		</div>
	);
};
