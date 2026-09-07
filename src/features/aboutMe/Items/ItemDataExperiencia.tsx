import { Building, Clock, Loader2, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import type { Experiences, PropsLang } from "@/types/currentLang.interface";

export const ItemDataExperiencia = ({ currentLocale }: PropsLang) => {
	const [data, setData] = useState<Experiences[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

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

	if (loading)
		return (
			<Loader2
				className="animate-spin text-primary"
				size={40}
				aria-label="Cargando"
			/>
		);

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
						className="rounded-2xl border border-border bg-card shadow-md hover:bg-gradient-to-tr from-secondary/30 via-secondary/5 to-transparent hover:shadow-xl hover:brightness-105 hover:-translate-y-2 hover:scale-[1.02] transition-all duration-500 ease-in-out p-8"
					>
						<div className="flex items-center gap-4 mb-4">
							<img
								src={`https://pub-a3fda08feb4f417fa5634c34e7959461.r2.dev/${img}`}
								alt={alt}
								className="w-12 h-12 rounded-full bg-muted object-cover"
								loading="lazy"
								decoding="async"
								draggable="false"
							/>
							<div className="flex flex-col">
								<h2 className="text-lg font-semibold text-foreground">
									{title}
								</h2>
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
