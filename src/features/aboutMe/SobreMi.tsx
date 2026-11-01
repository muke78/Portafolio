import { ItemDataSobreMi } from "@/features/aboutMe/Items/ItemDataSobreMi";
import { getI18N } from "@/i18n";
import type { PropsLang } from "@/types/currentLang.interface";

export const SobreMi = ({ currentLocale }: PropsLang) => {
	const i18n = getI18N({ currentLocale });

	return (
		<div className="w-full flex flex-col p-4">
			<h2 className="font-serif-display text-subtitle font-normal mb-4">
				{i18n.ABOUTME.ABOUT_TITLE}
			</h2>
			<ItemDataSobreMi currentLocale={currentLocale} />
		</div>
	);
};
