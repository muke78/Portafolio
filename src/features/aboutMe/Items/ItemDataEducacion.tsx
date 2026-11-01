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
				setData(body.data);
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
		<div className="flex flex-col gap-4" data-reveal-group>
			{data.map(
				({
					education_id,
					institution,
					subtitle,
					description,
					image,
					period,
				}) => (
					<div
						key={education_id}
						data-reveal
						className="grid grid-cols-1 w-full rounded-xl border border-border bg-card overflow-hidden hover-lift"
					>
						<img
							className="rounded-t-lg w-full h-auto"
							src={image}
							alt={institution}
							width={940}
							height={220}
							loading="lazy"
							decoding="async"
							draggable="false"
						/>
						<div className="p-5">
							<div className="flex justify-between">
								<span className="text-2xl">{institution}</span>
								<p className="inline-flex place-items-center text-right text-secondary-foreground text-nowrap font-medium rounded-full bg-secondary px-3 py-1">
									{period}
								</p>
							</div>
							<p className="text-lg font-medium text-secondary">{subtitle}</p>
							<div className="pt-4">
								<p className="font-normal text-base/8">{description}</p>
							</div>
						</div>
					</div>
				),
			)}
		</div>
	);
};
