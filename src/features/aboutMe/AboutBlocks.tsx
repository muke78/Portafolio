import { StoryBlock } from "@/components/sections/StoryBlock";
import { ItemDataEducacion } from "@/features/aboutMe/Items/ItemDataEducacion";
import { ItemDataExperiencia } from "@/features/aboutMe/Items/ItemDataExperiencia";
import { ItemDataHabilidades } from "@/features/aboutMe/Items/ItemDataHabilidades";
import { ItemDataSobreMi } from "@/features/aboutMe/Items/ItemDataSobreMi";
import { getI18N } from "@/i18n";
import type { PropsLang } from "@/types/currentLang.interface";

/**
 * The About story, one island per scene (each hydrates when it comes into
 * view). Order = reading order of the page: who I am, where I studied, where
 * I worked, what I work with.
 */
export const AboutMeBlock = ({ currentLocale }: PropsLang) => {
	const i18n = getI18N({ currentLocale });
	return (
		<StoryBlock
			title={i18n.ABOUTME.ABOUT_TITLE}
			lead={i18n.ABOUTME.ABOUT_TITLE_CARD}
		>
			<ItemDataSobreMi currentLocale={currentLocale} />
		</StoryBlock>
	);
};

export const EducationBlock = ({ currentLocale }: PropsLang) => {
	const i18n = getI18N({ currentLocale });
	return (
		<StoryBlock title={i18n.EDUCATION.EDUCATION_TITLE}>
			<ItemDataEducacion currentLocale={currentLocale} />
		</StoryBlock>
	);
};

export const ExperienceBlock = ({ currentLocale }: PropsLang) => {
	const i18n = getI18N({ currentLocale });
	return (
		<StoryBlock title={i18n.ABOUTME.EXPERIENCE}>
			<ItemDataExperiencia currentLocale={currentLocale} />
		</StoryBlock>
	);
};

export const SkillsBlock = ({ currentLocale }: PropsLang) => {
	const i18n = getI18N({ currentLocale });
	return (
		<StoryBlock title={i18n.SKILLS.SKILLS_TITLE} layout="stacked">
			<ItemDataHabilidades currentLocale={currentLocale} />
		</StoryBlock>
	);
};
