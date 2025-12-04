import { ItemSkills } from "@/components/ui/About/Items/ItemSkills.tsx";
import { getI18N } from "@/i18n";
import type { PropsLang } from "@/interfaces/currentLang.interface";

export const Skills = ({ currentLocale }: PropsLang) => {
	const i18n = getI18N({ currentLocale });
	return (
		<div className="w-full flex flex-col">
			<span className="font-bold text-5xl mb-4">
				{" "}
				{i18n.SKILLS.SKILLS_TITLE}
			</span>

			<div className="animate__animated animate__zoomIn">
				<div className="grid md:grid-cols-2 lg:grid-cols-3 grid-cols-1 p-4 gap-4">
					<ItemSkills currentLocale={currentLocale} />
				</div>
			</div>
		</div>
	);
};
