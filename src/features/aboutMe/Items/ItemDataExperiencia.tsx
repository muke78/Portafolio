import { Clock, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { SkeletonExperience } from "@/features/aboutMe/Items/SkeletonAbout";
import { getI18N } from "@/i18n";
import type { Experiences, PropsLang } from "@/types/currentLang.interface";

const R2 = "https://pub-a3fda08feb4f417fa5634c34e7959461.r2.dev";

// The backend packs several facts into one string; split them so each gets
// its own level of the hierarchy.
//   title:       "Role | Context"            -> role / context
//   description: "Company · Contract type"   -> company / contract type
const splitOnce = (value: string, separator: string): [string, string] => {
	const at = value.indexOf(separator);
	return at === -1
		? [value.trim(), ""]
		: [value.slice(0, at).trim(), value.slice(at + separator.length).trim()];
};

/**
 * Experience card - reading hierarchy (UI_STANDARDS 5.3):
 *   1. Role .......... serif, dominant (text-heading); context under it, muted
 *   2. Company ....... medium weight, next to the logo, with the contract type
 *                      as a small chip
 *   3. Period / place  smallest, muted, after a hairline
 */
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
		<div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
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
				}) => {
					const [role, context] = splitOnce(title, "|");
					const [company, contract] = splitOnce(description, "·");
					return (
						<article
							key={experience_id}
							data-reveal
							className="flex flex-col rounded-2xl border border-border bg-card p-7 hover-lift"
						>
							{/* 2 - company */}
							<div className="flex items-center gap-3">
								<img
									src={`${R2}/${img}`}
									alt={alt}
									width={40}
									height={40}
									className="h-10 w-10 shrink-0 rounded-full border border-border bg-muted object-cover"
									loading="lazy"
									decoding="async"
									draggable="false"
								/>
								<div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
									<p className="text-base font-medium text-foreground">
										{company}
									</p>
									{(contract || work) && (
										<span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
											{contract || work}
										</span>
									)}
								</div>
							</div>

							{/* 1 - role */}
							<h3 className="font-serif-display text-heading mt-6">{role}</h3>
							{context && (
								<p className="mt-2 text-base text-muted-foreground">
									{context}
								</p>
							)}

							{/* 3 - period and place */}
							<dl className="mt-6 flex flex-col gap-2 border-t border-border pt-5 text-sm text-muted-foreground">
								<div className="flex items-start gap-2">
									<dt className="sr-only">{i18n.EXPERIENCE_CARD.PERIOD}</dt>
									<Clock
										size={16}
										aria-hidden="true"
										className="mt-0.5 shrink-0"
									/>
									<dd>{time}</dd>
								</div>
								<div className="flex items-start gap-2">
									<dt className="sr-only">{i18n.EXPERIENCE_CARD.PLACE}</dt>
									<MapPin
										size={16}
										aria-hidden="true"
										className="mt-0.5 shrink-0"
									/>
									<dd>{location}</dd>
								</div>
							</dl>
						</article>
					);
				},
			)}
		</div>
	);
};
