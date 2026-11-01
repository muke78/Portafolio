import { Building, ChartArea, HardDrive, Layout } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SectionTabs } from "@/components/sections/SectionTabs";
import { SkeletonTabsRow } from "@/features/aboutMe/Items/SkeletonAbout";
import {
	Backend,
	Companies,
	DataAnalyst,
	Frontend,
} from "@/features/projects/index";
import { SkeletonProjectsCard } from "@/features/projects/items/SkeletonProjectsCard";
import { getI18N } from "@/i18n";
import type {
	Projects,
	PropsLangWithProjects,
} from "@/types/currentLang.interface";

export const TabsProyectos = ({
	currentLocale,
	initialData = [],
	title,
}: PropsLangWithProjects & { title: string }) => {
	const [activeTab, setActiveTab] = useState<string>("frontend");
	const [mounted, setMounted] = useState<boolean>(false);
	const [data, setData] = useState<Projects[]>(initialData);
	const [loading, setLoading] = useState<boolean>(false);
	const [previousDataLength, setPreviousDataLength] = useState<number>(
		initialData.length,
	);

	const i18n = getI18N({ currentLocale });

	// Determinamos cuántos skeletons mostrar basado en la data
	const getSkeletonCount = () => {
		// Si hay data previa, usamos esa longitud
		if (previousDataLength > 0) {
			return previousDataLength;
		}
		// Si no hay data previa, usamos un número por defecto según el tab
		switch (activeTab) {
			case "frontend":
				return 7;
			case "backend":
				return 9;
			case "companies":
				return 3;
			case "dataAnalyst":
				return 2;
			default:
				return 3;
		}
	};

	const skeletonCount = getSkeletonCount();
	const skeletonItems = Array(skeletonCount).fill(null);

	useEffect(() => {
		const savedTab = localStorage.getItem("activeProjectTab");
		if (savedTab) {
			setActiveTab(savedTab);
		}
		setMounted(true);
	}, []);

	useEffect(() => {
		if (mounted) {
			localStorage.setItem("activeProjectTab", activeTab);
		}
	}, [activeTab, mounted]);

	useEffect(() => {
		if (initialData.length > 0) return;
		async function fetchData() {
			try {
				setLoading(true);

				const result = await fetch(
					`/api/projects?currentLocale=${currentLocale}`,
				);
				const projects = await result.json();
				setData(projects.data.rows as Projects[]);

				if (projects.data.rows.length > 0) {
					setPreviousDataLength(projects.data.rows.length);
				}
			} catch (error) {
				console.error("Error al cargar proyectos:", error);
			} finally {
				setLoading(false);
			}
		}
		fetchData();
	}, [currentLocale, initialData.length]);

	const projectsByCategory = useMemo(() => {
		return {
			frontend: data.filter((p) => p.category === "frontend"),
			backend: data.filter((p) => p.category === "backend"),
			companies: data.filter((p) => p.category === "companies"),
			dataAnalyst: data.filter((p) => p.category === "dataAnalyst"),
		};
	}, [data]);

	if (!mounted) {
		return (
			<div className="flex flex-col gap-6">
				<SkeletonTabsRow count={4} label={i18n.COMMON.LOADING} />
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					{[0, 1, 2, 3].map((i) => (
						<SkeletonProjectsCard key={i} />
					))}
				</div>
			</div>
		);
	}

	const tabs = [
		{
			id: "frontend",
			label: i18n.PROJECTS.PROJECTS_TITLE_BUTTON_F,
			icon: <Layout size={18} />,
		},
		{
			id: "backend",
			label: i18n.PROJECTS.PROJECTS_TITLE_BUTTON_B,
			icon: <HardDrive size={18} />,
		},
		{
			id: "companies",
			label: i18n.PROJECTS.PROJECTS_TITLE_BUTTON_C,
			icon: <Building size={18} />,
		},
		{
			id: "dataAnalyst",
			label: i18n.PROJECTS.PROJECTS_TITLE_BUTTON_D,
			icon: <ChartArea size={18} />,
		},
	];

	return (
		<div
			className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16"
			data-reveal-group
		>
			{/* Left (4 cols): title + category list. Sticky on desktop. */}
			<div className="lg:col-span-4">
				<div className="flex flex-col gap-8 lg:sticky lg:top-28">
					<h2 className="font-serif-display text-title" data-split>
						{title}
					</h2>
					<SectionTabs
						items={tabs}
						active={activeTab}
						onChange={setActiveTab}
						label={title}
					/>
				</div>
			</div>

			{/* Right (8 cols): the cards. */}
			<div className="min-w-0 lg:col-span-8">
				{loading ? (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						{skeletonItems.map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: placeholder-only list, fixed length, never reordered
							<SkeletonProjectsCard key={i} />
						))}
					</div>
				) : (
					<>
						{activeTab === "frontend" && (
							<Frontend
								currentLocale={currentLocale}
								data={projectsByCategory.frontend}
							/>
						)}
						{activeTab === "backend" && (
							<Backend
								currentLocale={currentLocale}
								data={projectsByCategory.backend}
							/>
						)}
						{activeTab === "companies" && (
							<Companies
								currentLocale={currentLocale}
								data={projectsByCategory.companies}
							/>
						)}
						{activeTab === "dataAnalyst" && (
							<DataAnalyst
								currentLocale={currentLocale}
								data={projectsByCategory.dataAnalyst}
							/>
						)}
					</>
				)}
			</div>
		</div>
	);
};
