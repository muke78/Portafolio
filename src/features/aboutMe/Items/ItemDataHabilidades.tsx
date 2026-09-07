import { ChevronDown } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import type { PropsLang } from "@/types/currentLang.interface";
import { dataTabsAcercaDeEN } from "@/data/locales/en/dataTabsAcercaDeEN";
import { dataTabsAcercaDe } from "@/data/locales/es/dataTabsAcercaDe";
import { dataTabsAcercaDeFR } from "@/data/locales/fr/dataTabsAcercaDeFR";

const langTraduceData: Record<string, typeof dataTabsAcercaDe> = {
	es: dataTabsAcercaDe,
	en: dataTabsAcercaDeEN,
	fr: dataTabsAcercaDeFR,
};

const extractTech = (images: string[]): string[] =>
	images.flatMap((image) => image.split("?i=")[1]?.split(",") ?? []);

export const ItemDataHabilidades = ({ currentLocale }: PropsLang) => {
	const categories = useMemo(
		() => langTraduceData[currentLocale] || dataTabsAcercaDe,
		[currentLocale],
	);

	const [activeIndex, setActiveIndex] = useState<number>(0);
	const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

	const handleImageLoad = useCallback((tech: string) => {
		setLoadedImages((prev) => ({ ...prev, [tech]: true }));
	}, []);

	const toggle = (index: number) =>
		setActiveIndex((prev) => (prev === index ? -1 : index));

	return (
		<div className="col-span-full flex flex-col gap-2">
			{categories.map(({ title, images }, index) => {
				const techs = extractTech(images);
				const open = activeIndex === index;
				return (
					<div
						key={title}
						className="rounded-xl border border-base-content/10 bg-base-100/60 backdrop-blur-sm overflow-hidden"
					>
						<button
							type="button"
							onClick={() => toggle(index)}
							className="w-full flex items-center justify-between px-5 py-4 hover:bg-base-content/5 transition-colors"
							aria-expanded={open}
						>
							<span className="text-lg font-medium text-left">{title}</span>
							<span className="flex items-center gap-3">
								<span className="text-xs text-base-content/60">
									{techs.length}
								</span>
								<ChevronDown
									size={18}
									className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
								/>
							</span>
						</button>
						<div
							className={`grid transition-[grid-template-rows] duration-300 ease-out ${
								open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
							}`}
						>
							<div className="overflow-hidden">
								<div className="flex flex-wrap gap-3 p-5 pt-2">
									{techs.map((tech) => (
										<div
											key={tech}
											className="flex flex-col items-center gap-1 w-16"
										>
											{!loadedImages[tech] && (
												<div className="skeleton h-10 w-10 rounded-md" />
											)}
											<img
												className={`w-10 h-10 transition-opacity duration-200 ${
													loadedImages[tech]
														? "opacity-100"
														: "opacity-0 absolute pointer-events-none"
												}`}
												src={`https://go-skill-icons.vercel.app/api/icons?i=${tech}`}
												alt={tech}
												onLoad={() => handleImageLoad(tech)}
												loading="lazy"
												decoding="async"
												draggable="false"
												width={40}
												height={40}
											/>
											<span className="text-[10px] text-base-content/70 truncate w-full text-center">
												{tech}
											</span>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
};
