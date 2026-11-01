import { useEffect, useState } from "react";
import { SkeletonAboutMe } from "@/features/aboutMe/Items/SkeletonAbout";
import { getI18N } from "@/i18n";
import type { About, PropsLang } from "@/types/currentLang.interface";

// Fase 5b: antes SobreMi.tsx leia texto fijo de i18n ABOUTME.* - ahora
// hace fetch a /api/about (Backend_Portafolio,
// docs/06-about-education-skills.md, tabla singleton), mismo patron que
// ItemDataExperiencia.tsx.
export const ItemDataSobreMi = ({ currentLocale }: PropsLang) => {
	const [data, setData] = useState<About | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const i18n = getI18N({ currentLocale });

	useEffect(() => {
		async function fetchData() {
			try {
				const result = await fetch(`/api/about?currentLocale=${currentLocale}`);
				const body = await result.json();
				setData(body.data);
			} catch (error) {
				console.error("Error cargando informacion de acerca de mi:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchData();
	}, [currentLocale]);

	if (loading || !data) return <SkeletonAboutMe label={i18n.COMMON.LOADING} />;

	const { image, title_card, subtitle, description } = data;

	return (
		<div
			data-reveal
			className="grid grid-cols-1 w-full rounded-xl border border-border bg-card overflow-hidden hover-lift"
		>
			<figure data-mask className="relative h-[400px] overflow-hidden bg-muted">
				<img
					data-parallax-img
					className="absolute inset-x-0 -top-[12%] h-[124%] w-full object-cover"
					src={image}
					alt={i18n.ABOUTME.ABOUT_TITLE}
					width={1600}
					height={400}
					loading="lazy"
					decoding="async"
					draggable="false"
				/>
			</figure>
			<div className="p-5">
				<div className="flex justify-between">
					<span className="text-2xl">{title_card}</span>
				</div>
				<p className="inline-flex items-center rounded-full bg-secondary text-secondary-foreground text-base font-medium my-2 px-3 py-1 w-fit">
					{subtitle}
				</p>
				<div>
					<p className="font-normal text-base/8" data-scrub-text>
						{description}
					</p>
				</div>
			</div>
		</div>
	);
};
