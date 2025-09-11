import { ItemDataExperiencia } from "@/components/features/aboutMe/Items/ItemDataExperiencia";
import { getI18N } from "@/i18n";
import type { PropsLang } from "@/interfaces/currentLang.interface";

export const Experiencia = ({ currentLocale }: PropsLang) => {
	const i18n = getI18N({ currentLocale });
	return (
		<div className="w-full flex flex-col">
			<span className="font-bold text-5xl mb-4">
				{" "}
				{i18n.ABOUTME.EXPERIENCE}
			</span>

			<div className="animate__animated animate__zoomIn">
				<div className="flex flex-col hero-content gap-4 pt-4">
					<ItemDataExperiencia currentLocale={currentLocale} />
				</div>
			</div>
		</div>
	);
};
