import {
	Briefcase,
	GraduationCap,
	Loader2,
	PencilRuler,
	UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Educacion } from "@/features/aboutMe/Educacion";
import { Experiencia } from "@/features/aboutMe/Experiencia";
import { Habilidades } from "@/features/aboutMe/Habilidades";
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
			<Loader2
				className="animate-spin text-primary"
				size={40}
				aria-label="Cargando"
			/>
		);
	}

	const getShortText = (text: string, length: number) => {
		return text.slice(0, length);
	};

	return (
		<div className="flex flex-col lg:flex-col lg:w-full">
			{/* Contenedor de los botones con un ancho fijo */}
			<div className="flex justify-center items-center lg:justify-start lg:items-start md:justify-start md:items-start gap-4">
				<Button
					type="button"
					variant={activeTab === "sobreMi" ? "default" : "outline"}
					className="rounded-full lg:h-9 md:h-8 h-7 lg:text-lg md:text-base text-sm px-3"
					onClick={() => setActiveTab("sobreMi")}
				>
					<span className=" sm:inline md:inline lg:inline">
						{<UserRound />}
					</span>
					{/* Texto para pantallas pequeñas (sm) */}
					<span className="hidden sm:inline md:hidden lg:hidden">
						{getShortText(i18n.ABOUTME.ABOUT_TITLE, 5)}
					</span>
					{/* Texto completo para pantallas medianas y grandes (md y lg) */}
					<span className="hidden md:inline lg:inline">
						{i18n.ABOUTME.ABOUT_TITLE}
					</span>
				</Button>

				<Button
					type="button"
					variant={activeTab === "educacion" ? "default" : "outline"}
					className="rounded-full lg:h-9 md:h-8 h-7 lg:text-lg md:text-base text-sm px-3"
					onClick={() => setActiveTab("educacion")}
				>
					<span className="sm:inline md:inline lg:inline">
						{<GraduationCap />}
					</span>
					{/* Texto para pantallas pequeñas (sm) */}
					<span className="hidden sm:inline md:hidden lg:hidden">
						{getShortText(i18n.EDUCATION.EDUCATION_TITLE, 5)}
					</span>
					{/* Texto completo para pantallas medianas y grandes (md y lg) */}
					<span className="hidden md:inline lg:inline">
						{i18n.EDUCATION.EDUCATION_TITLE}
					</span>
				</Button>

				<Button
					type="button"
					variant={activeTab === "experiencia" ? "default" : "outline"}
					className="rounded-full lg:h-9 md:h-8 h-7 lg:text-lg md:text-base text-sm px-3"
					onClick={() => setActiveTab("experiencia")}
				>
					<span className=" sm:inline md:inline lg:inline">
						{<Briefcase />}
					</span>

					{/* Texto para pantallas pequeñas (sm) */}
					<span className="hidden sm:inline md:hidden lg:hidden">
						{getShortText(i18n.ABOUTME.EXPERIENCE, 5)}
					</span>

					{/* Texto completo para pantallas medianas y grandes (md y lg) */}
					<span className="hidden md:inline lg:inline">
						{i18n.ABOUTME.EXPERIENCE}
					</span>
				</Button>

				<Button
					type="button"
					variant={activeTab === "habilidades" ? "default" : "outline"}
					className="rounded-full lg:h-9 md:h-8 h-7 lg:text-lg md:text-base text-sm px-3"
					onClick={() => setActiveTab("habilidades")}
				>
					<span className=" sm:inline md:inline lg:inline">
						{<PencilRuler />}
					</span>
					{/* Texto para pantallas pequeñas (sm) */}
					<span className="hidden sm:inline md:hidden lg:hidden">
						{getShortText(i18n.SKILLS.SKILLS_TITLE, 5)}
					</span>
					{/* Texto completo para pantallas medianas y grandes (md y lg) */}
					<span className="hidden md:inline lg:inline">
						{i18n.SKILLS.SKILLS_TITLE}
					</span>
				</Button>
			</div>

			{/* Separador solo visible en pantallas grandes */}
			<hr className="my-4 border-border" />
			{/* Contenedor del contenido del tab con un ancho flexible */}
			<div className="flex-1 w-full flex flex-col anim-zoom-in">
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
