import { ItemDataEducacion } from "@/features/aboutMe/Items/ItemDataEducacion";
import { getI18N } from "@/i18n";
import type { PropsLang } from "@/types/currentLang.interface";

export const Educacion = ({ currentLocale }: PropsLang) => {
	const i18n = getI18N({ currentLocale });
	return (
		<div className="flex flex-col p-4">
			<span className="font-serif-display text-[clamp(28px,4vw,48px)] font-normal mb-4">
				{i18n.EDUCATION.EDUCATION_TITLE}
			</span>
			<ItemDataEducacion currentLocale={currentLocale} />
		</div>
	);
};
