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
				setData(body.data ?? null);
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
			className="grid w-full grid-cols-1 overflow-hidden rounded-xl border border-border bg-card hover-lift"
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
			{/* Reading order: 1 headline (serif), 2 label, 3 description. */}
			<div className="flex flex-col p-6 md:p-8">
				<p className="eyebrow">{subtitle}</p>
				<h3 className="font-serif-display text-heading mt-3 text-balance">
					{title_card}
				</h3>
				<p
					className="mt-6 border-t border-border pt-6 text-base/8 text-foreground"
					data-scrub-text
				>
					{description}
				</p>
			</div>
		</div>
	);
};
