import { Briefcase, GraduationCap, PencilRuler, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { SectionTabs } from "@/components/sections/SectionTabs";
import { Educacion } from "@/features/aboutMe/Educacion";
import { Experiencia } from "@/features/aboutMe/Experiencia";
import { Habilidades } from "@/features/aboutMe/Habilidades";
import {
	SkeletonAboutMe,
	SkeletonTabsRow,
} from "@/features/aboutMe/Items/SkeletonAbout";
import { SobreMi } from "@/features/aboutMe/SobreMi";
import { getI18N } from "@/i18n";
import type { PropsLang } from "@/types/currentLang.interface";

export const TabsAcerca = ({ currentLocale }: PropsLang) => {
	const [activeTab, setActiveTab] = useState<string>("experiencia");
	const [mounted, setMounted] = useState<boolean>(false);

	const i18n = getI18N({ currentLocale });

	useEffect(() => {
		const savedTab = localStorage.getItem("activeTab");
		if (savedTab) {
			setActiveTab(savedTab);
		}
		setMounted(true);
	}, []);

	useEffect(() => {
		if (mounted) {
			localStorage.setItem("activeTab", activeTab);
		}
	}, [activeTab, mounted]);

	if (!mounted) {
		return (
			<div className="flex flex-col gap-6">
				<SkeletonTabsRow count={4} label={i18n.COMMON.LOADING} />
				<SkeletonAboutMe label={i18n.COMMON.LOADING} />
			</div>
		);
	}

	const tabs = [
		{
			id: "sobreMi",
			label: i18n.ABOUTME.ABOUT_TITLE,
			icon: <UserRound size={18} />,
		},
		{
			id: "educacion",
			label: i18n.EDUCATION.EDUCATION_TITLE,
			icon: <GraduationCap size={18} />,
		},
		{
			id: "experiencia",
			label: i18n.ABOUTME.EXPERIENCE,
			icon: <Briefcase size={18} />,
		},
		{
			id: "habilidades",
			label: i18n.SKILLS.SKILLS_TITLE,
			icon: <PencilRuler size={18} />,
		},
	];

	return (
		<div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
			{/* Left (4 cols): a short intro and the tab list. Sticky on desktop. */}
			<div className="lg:col-span-4">
				<div className="flex flex-col gap-8 lg:sticky lg:top-28">
					<p
						className="khelde-lead hidden text-muted-foreground lg:block"
						data-reveal
					>
						{i18n.ABOUTME.ABOUT_TITLE_CARD}
					</p>
					<SectionTabs
						items={tabs}
						active={activeTab}
						onChange={setActiveTab}
						label={i18n.ABOUTME.ABOUT_TITLE}
					/>
				</div>
			</div>

			{/* Right (8 cols): the active panel is the section's focal point. */}
			<div className="flex min-w-0 flex-col lg:col-span-8" data-reveal>
				{activeTab === "experiencia" && (
					<Experiencia currentLocale={currentLocale} />
				)}
				{activeTab === "educacion" && (
					<Educacion currentLocale={currentLocale} />
				)}
				{activeTab === "habilidades" && (
					<Habilidades currentLocale={currentLocale} />
				)}
				{activeTab === "sobreMi" && <SobreMi currentLocale={currentLocale} />}
			</div>
		</div>
	);
};
