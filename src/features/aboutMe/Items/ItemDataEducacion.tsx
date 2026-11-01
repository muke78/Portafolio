import { useEffect, useState } from "react";
import { SkeletonEducation } from "@/features/aboutMe/Items/SkeletonAbout";
import { getI18N } from "@/i18n";
import type { Education, PropsLang } from "@/types/currentLang.interface";

// Fase 5b: antes Educacion.tsx tenia UNA institucion hardcodeada (imagen y
// texto de i18n UNIVERSITY.*) - ahora hace fetch a /api/education
// (Backend_Portafolio, docs/06-about-education-skills.md), que ya soporta
// una lista, mismo patron que ItemDataExperiencia.tsx.
export const ItemDataEducacion = ({ currentLocale }: PropsLang) => {
	const [data, setData] = useState<Education[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const i18n = getI18N({ currentLocale });

	useEffect(() => {
		async function fetchData() {
			try {
				const result = await fetch(
					`/api/education?currentLocale=${currentLocale}`,
				);
				const body = await result.json();
				setData(body.data ?? []);
			} catch (error) {
				console.error("Error cargando educacion:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchData();
	}, [currentLocale]);

	if (loading) return <SkeletonEducation label={i18n.COMMON.LOADING} />;

	return (
		<div className="flex flex-col gap-4">
			{data.map(
				({
					education_id,
					institution,
					subtitle,
					description,
					image,
					period,
				}) => (
					// Reading order (UI_STANDARDS 5.3): 1 institution (serif, dominant),
					// 2 degree, 3 period (small label), 4 description after a hairline.
					<article
						key={education_id}
						data-reveal
						className="grid w-full grid-cols-1 overflow-hidden rounded-xl border border-border bg-card hover-lift"
					>
						<img
							className="h-auto w-full"
							src={image}
							alt={institution}
							width={940}
							height={220}
							loading="lazy"
							decoding="async"
							draggable="false"
						/>
						<div className="flex flex-col p-6 md:p-8">
							<p className="eyebrow">{period}</p>
							<h3 className="font-serif-display text-heading mt-3 text-balance">
								{institution}
							</h3>
							<p className="mt-2 text-lg font-medium text-foreground">
								{subtitle}
							</p>
							<p
								className="mt-6 border-t border-border pt-6 text-base/8 text-foreground"
								data-scrub-text
							>
								{description}
							</p>
						</div>
					</article>
				),
			)}
		</div>
	);
};
