import { ItemDataExperiencia } from "@/features/aboutMe/Items/ItemDataExperiencia";
import { getI18N } from "@/i18n";
import type { PropsLang } from "@/types/currentLang.interface";

export const Experiencia = ({ currentLocale }: PropsLang) => {
	const i18n = getI18N({ currentLocale });
	return (
		<div className="w-full flex flex-col">
			<span className="font-serif-display text-[clamp(28px,4vw,48px)] font-normal mb-4">
				{" "}
				{i18n.ABOUTME.EXPERIENCE}
			</span>

			<div className="anim-zoom-in">
				<div className="flex flex-col gap-4 pt-4">
					<ItemDataExperiencia currentLocale={currentLocale} />
				</div>
			</div>
		</div>
	);
};
