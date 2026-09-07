import { useCallback, useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
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

// Todas las categorías se muestran siempre (sin acordeón) - con tantos
// iconos, la densidad se controla achicando cada chip en vez de
// esconder contenido detrás de un click.
export const ItemDataHabilidades = ({ currentLocale }: PropsLang) => {
	const categories = useMemo(
		() => langTraduceData[currentLocale] || dataTabsAcercaDe,
		[currentLocale],
	);

	const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

	const handleImageLoad = useCallback((tech: string) => {
		setLoadedImages((prev) => ({ ...prev, [tech]: true }));
	}, []);

	return (
		<div className="col-span-full flex flex-col">
			{categories.map(({ title, images }) => {
				const techs = extractTech(images);
				return (
					<div
						key={title}
						className="py-5 border-b border-border last:border-b-0"
					>
						<div className="flex items-baseline gap-2 mb-4">
							<span className="text-base font-medium">{title}</span>
							<span className="text-xs font-mono text-muted-foreground">
								{techs.length}
							</span>
						</div>
						<div className="flex flex-wrap gap-3">
							{techs.map((tech) => (
								<div
									key={tech}
									title={tech}
									className="flex items-center gap-2 rounded-full border border-border bg-muted/50 pl-2 pr-4 py-2"
								>
									<span className="relative flex h-7 w-7 shrink-0 items-center justify-center">
										{!loadedImages[tech] && (
											<Skeleton className="absolute inset-0 rounded-full" />
										)}
										<img
											className={`h-7 w-7 rounded-full object-contain transition-opacity duration-200 ${
												loadedImages[tech] ? "opacity-100" : "opacity-0"
											}`}
											src={`https://go-skill-icons.vercel.app/api/icons?i=${tech}`}
											alt=""
											onLoad={() => handleImageLoad(tech)}
											loading="lazy"
											decoding="async"
											draggable="false"
											width={28}
											height={28}
										/>
									</span>
									<span className="text-sm text-muted-foreground whitespace-nowrap">
										{tech}
									</span>
								</div>
							))}
						</div>
					</div>
				);
			})}
		</div>
	);
};
