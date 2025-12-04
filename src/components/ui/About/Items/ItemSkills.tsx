import { useCallback, useMemo, useState } from "react";
import type { PropsLang } from "@/interfaces/currentLang.interface.ts";
import { dataTabsAcercaDeEN } from "@/utils/en/dataTabsAboutmeEN";
import { dataTabsAcercaDe } from "@/utils/es/dataTabsAboutme";
import { dataTabsAcercaDeFR } from "@/utils/fr/dataTabsAboutmeFR";
import { motion } from "framer-motion";

const langTraduceData: Record<string, typeof dataTabsAcercaDe> = {
	es: dataTabsAcercaDe,
	en: dataTabsAcercaDeEN,
	fr: dataTabsAcercaDeFR,
};

export const ItemSkills = ({ currentLocale }: PropsLang) => {
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
				<motion.div
					key={title}
					className={`card bg-base-100 shadow-md hover:bg-gradient-to-tr from-secondary/30 via-secondary/5 to-transparent 
            hover:shadow-xl hover:brightness-105 transition-discrete duration-500 ease-in-out  p-8 ${
							index === memorization.length - 1 ? "lg:col-span-2" : ""
						}`}
					whileHover={{
						y: -8,
						scale: 1.03,
						transition: { duration: 0.5, ease: "easeInOut" },
					}}
				>
					<div className="flex flex-col justify-start items-start gap-2">
						<span className="text-2xl font-semibold">{title}</span>
						{images.map((image) => {
							const techNames = image.split("?i=")[1].split(",");
							return (
								<div key={image} className="flex flex-wrap gap-2 mt-5">
									{techNames.map((tech) => (
										<div
											key={tech}
											className="flex flex-col items-center hover:-translate-y-3 transition-discrete duration-500 ease-in-out"
										>
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
												decoding="async"
												draggable="false"
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
				</motion.div>
			))}
		</>
	);
};
