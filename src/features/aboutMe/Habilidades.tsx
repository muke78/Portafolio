import { ItemDataHabilidades } from "@/features/aboutMe/Items/ItemDataHabilidades";
import { getI18N } from "@/i18n";
import type { PropsLang } from "@/types/currentLang.interface";

export const Habilidades = ({ currentLocale }: PropsLang) => {
	const i18n = getI18N({ currentLocale });
	return (
		<div className="w-full flex flex-col">
			<span className="font-serif-display text-[clamp(28px,4vw,48px)] font-normal mb-4">
				{i18n.SKILLS.SKILLS_TITLE}
			</span>

			<div className="anim-zoom-in p-2">
				<ItemDataHabilidades currentLocale={currentLocale} />
			</div>
		</div>
	);
};
