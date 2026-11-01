import { Building, Clock, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { SkeletonExperience } from "@/features/aboutMe/Items/SkeletonAbout";
import { getI18N } from "@/i18n";
import type { Experiences, PropsLang } from "@/types/currentLang.interface";

export const ItemDataExperiencia = ({ currentLocale }: PropsLang) => {
	const [data, setData] = useState<Experiences[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const i18n = getI18N({ currentLocale });

	useEffect(() => {
		async function fetchData() {
			try {
				const result = await fetch(
					`/api/experiences?currentLocale=${currentLocale}`,
				);
				const experiences = await result.json();
				setData(experiences.data);
			} catch (error) {
				console.error("Error cargando experiencias:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchData();
	}, [currentLocale]);

	if (loading) return <SkeletonExperience label={i18n.COMMON.LOADING} />;

	return (
		<div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
			{data.map(
				({
					experience_id,
					work,
					title,
					description,
					img,
					alt,
					time,
					location,
				}) => (
					<div
						key={experience_id}
						className="rounded-2xl border border-border bg-card hover-lift p-8"
					>
						<div className="flex items-center gap-4 mb-4">
							<img
								src={`https://pub-a3fda08feb4f417fa5634c34e7959461.r2.dev/${img}`}
								alt={alt}
								width={48}
								height={48}
								className="w-12 h-12 rounded-full bg-muted object-cover"
								loading="lazy"
								decoding="async"
								draggable="false"
							/>
							<div className="flex flex-col">
								<h3 className="text-lg font-semibold text-foreground">
									{title}
								</h3>
								{work && (
									<span className="inline-flex w-fit items-center rounded-full bg-primary text-primary-foreground font-medium px-3 py-1 my-2">
										{work}
									</span>
								)}
							</div>
						</div>

						<div className="text-sm space-y-2 text-muted-foreground">
							<div className="flex items-center gap-2">
								<Building className="text-muted-foreground" />
								<span>{description}</span>
							</div>

							<div className="flex items-center gap-2">
								<Clock className="text-muted-foreground" />
								<span>{time}</span>
							</div>

							<div className="flex items-center gap-2">
								<MapPin className="text-muted-foreground" />
								<span>{location}</span>
							</div>
						</div>
					</div>
				),
			)}
		</div>
	);
};
