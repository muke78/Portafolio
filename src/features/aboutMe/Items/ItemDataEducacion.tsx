import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
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

	if (loading)
		return (
			<Loader2
				className="animate-spin text-primary"
				size={40}
				aria-label={i18n.COMMON.LOADING}
			/>
		);

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
					<div
						key={education_id}
						className="grid grid-cols-1 w-full rounded-xl border border-border bg-card overflow-hidden shadow-md hover:bg-gradient-to-tr from-secondary/30 via-secondary/5 to-transparent hover:shadow-xl hover:brightness-105 hover:-translate-y-2 hover:scale-[1.02] transition-all duration-500 ease-in-out anim-zoom-in"
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
