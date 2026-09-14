import { ItemDataSobreMi } from "@/features/aboutMe/Items/ItemDataSobreMi";
import { getI18N } from "@/i18n";
import type { PropsLang } from "@/types/currentLang.interface";

export const SobreMi = ({ currentLocale }: PropsLang) => {
	const i18n = getI18N({ currentLocale });

	return (
		<div className="w-full flex flex-col p-4">
			<span className="font-serif-display text-[clamp(28px,4vw,48px)] font-normal mb-4">
				{i18n.ABOUTME.ABOUT_TITLE}
			</span>
			<ItemDataSobreMi currentLocale={currentLocale} />
		</div>
	);
};
