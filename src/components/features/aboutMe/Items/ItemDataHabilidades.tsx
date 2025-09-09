import type { PropsLang } from "@/interfaces/currentLang.interface";
import { dataTabsAcercaDeEN } from "@/utils/en/dataTabsAcercaDeEN";
import { dataTabsAcercaDe } from "@/utils/es/dataTabsAcercaDe";
import { dataTabsAcercaDeFR } from "@/utils/fr/dataTabsAcercaDeFR";

import { useCallback, useMemo, useState } from "react";

const langTraduceData: Record<string, typeof dataTabsAcercaDe> = {
	es: dataTabsAcercaDe,
	en: dataTabsAcercaDeEN,
	fr: dataTabsAcercaDeFR,
};

export const ItemDataHabilidades = ({ currentLocale }: PropsLang) => {
	const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

	const memorization = useMemo(
		() => langTraduceData[currentLocale] || dataTabsAcercaDe,
		[currentLocale],
	);

	const handleImageLoad = useCallback((tech: string) => {
		setLoadedImages((prev) => ({ ...prev, [tech]: true }));
	}, []);

	return (
		<>
			{memorization.map(({ title, images }, index) => (
				<div
					key={index}
					className={`card bg-base-100 shadow-md border border-transparent hover:bg-gradient-to-tr from-secondary/30 via-secondary/5 to-transparent 
            hover:shadow-xl hover:scale-[1.03] hover:brightness-105 transition-all duration-500 ease-in-out  p-8 ${
							index === memorization.length - 1 ? "lg:col-span-2" : ""
						}`}
				>
					<div className="flex flex-col justify-start items-start gap-2">
						<span className="text-2xl font-semibold">{title}</span>
						{images.map((image, imgIndex) => {
							const techNames = image.split("?i=")[1].split(",");
							return (
								<div key={imgIndex} className="flex flex-wrap gap-2 mt-5">
									{techNames.map((tech, techIndex) => (
										<div key={techIndex} className="flex flex-col items-center">
											{!loadedImages[tech] && (
												<div className="skeleton h-12 w-12"></div>
											)}
											<img
												className={`leading-6 transition-opacity duration-300 ${
													loadedImages[tech]
														? "opacity-100"
														: "opacity-0 absolute"
												}`}
												src={`https://go-skill-icons.vercel.app/api/icons?i=${tech}`}
												alt={`Icon for ${tech}`}
												onLoad={() => handleImageLoad(tech)}
												loading="lazy"
											/>

											<span className="text-xs mt-1 text-base-content">
												{tech}
											</span>
										</div>
									))}
								</div>
							);
						})}
					</div>
				</div>
			))}
		</>
	);
};
