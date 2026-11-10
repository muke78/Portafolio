import { MessageSquare } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { splitIntoLanes } from "@/features/opinions/lanes";
import { OpinionLane } from "@/features/opinions/OpinionLane";
import { SkeletonTestimonialCard } from "@/features/opinions/SkeletonTestimonialCard";
import { getI18N } from "@/i18n";
import { isLocale, LOCALE_META } from "@/i18n/locales";
import type {
	PropsLangWithOpinions,
	Testimonial,
} from "@/types/currentLang.interface";

export const Opinions = ({
	currentLocale,
	initialData = [],
}: PropsLangWithOpinions) => {
	const [data, setData] = useState<Testimonial[]>(initialData);
	const [loading, setLoading] = useState<boolean>(initialData.length === 0);
	const i18n = getI18N({ currentLocale });
	// Two lanes that read as one list: newest first, one on top, the next below.
	const lanes = useMemo(() => splitIntoLanes(data), [data]);
	const dateLocale =
		LOCALE_META[isLocale(currentLocale) ? currentLocale : "es"].bcp47;

	useEffect(() => {
		if (initialData.length > 0) return;
		async function fetchData() {
			try {
				const result = await fetch("/api/comments");
				const comments = await result.json();
				setData((comments.data ?? []) as Testimonial[]);
			} catch (error) {
				console.error("Error al cargar comentarios:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchData();
	}, [initialData.length]);

	if (loading) {
		return (
			// biome-ignore lint/a11y/useSemanticElements: <output> isn't the right fit either (not a calculation result) - role=status on a div is the standard live-region loading pattern
			<div
				className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]"
				role="status"
				aria-busy="true"
				aria-label={i18n.COMMON.LOADING}
			>
				{/* Two strips, like the two lanes that replace them: no layout shift. */}
				{[0, 1].map((lane) => (
					<div key={lane} className="flex w-max gap-6 py-4">
						{[0, 1, 2, 3].map((i) => (
							<SkeletonTestimonialCard key={i} />
						))}
					</div>
				))}
			</div>
		);
	}

	return (
		<div className="relative w-full overflow-hidden">
			<div className="mx-auto mb-16 grid max-w-[1240px] grid-cols-1 gap-10 px-6 lg:grid-cols-12 lg:items-end lg:gap-16">
				<div className="lg:col-span-7">
					<h2 className="font-serif-display text-title text-balance" data-split>
						{i18n.OPINIONS.OPINIONS_TITLE}
					</h2>
					<p
						className="khelde-lead mt-6 max-w-xl text-muted-foreground"
						data-reveal
					>
						{i18n.OPINIONS.OPINIONS_SUBTITLE}
					</p>
				</div>

				{/* One quiet column: how many people wrote, one line, one action. */}
				<div
					className="flex flex-col gap-6 border-t border-border pt-8 lg:col-span-5 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0"
					data-reveal
				>
					{data.length > 0 && (
						<p className="flex items-baseline gap-3">
							<span className="font-serif-display text-display leading-none">
								{data.length}
							</span>
							<span className="text-lg text-muted-foreground">
								{i18n.OPINIONS.OPINIONS_COUNT_LABEL}
							</span>
						</p>
					)}
					<p className="max-w-sm text-muted-foreground">
						{i18n.OPINIONS.OPINIONS_SUB_SUBTILE}
					</p>
					<button
						type="button"
						className="inline-flex h-12 w-fit items-center justify-center gap-2 rounded-full bg-primary px-6 text-base font-medium text-primary-foreground hover-press focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
						onClick={() =>
							window.dispatchEvent(
								new CustomEvent("khelde:open-comment-widget"),
							)
						}
						aria-label={i18n.OPINIONS.OPINIONS_REDIRECT_COMMENTS_PAGE}
					>
						<MessageSquare className="h-4 w-4" />
						{i18n.OPINIONS.OPINIONS_REDIRECT_COMMENTS_PAGE}
					</button>
				</div>
			</div>

			<div>
				{data.length === 0 ? (
					<div
						className="flex flex-col items-center justify-center min-h-[400px] px-8 py-12"
						aria-live="polite"
					>
						<div className="relative mb-8">
							<img
								src="/no_data.svg"
								alt={i18n.OPINIONS.OPINIONS_NOT_FOUND}
								aria-label={i18n.OPINIONS.OPINIONS_NOT_FOUND_DESCRIPTION}
								className="w-52 h-52 mx-auto opacity-70"
								loading="lazy"
								decoding="async"
								draggable="false"
							/>

							<div className="absolute -inset-6 rounded-full border-2 border-dashed border-primary/30" />
							<div className="absolute -top-2 -right-2 w-3 h-3 bg-primary/40 rounded-full" />
							<div className="absolute -bottom-2 -left-2 w-2 h-2 bg-secondary/40 rounded-full" />
						</div>

						<div className="text-center space-y-4 max-w-md">
							<h3 className="text-2xl font-semibold text-muted-foreground mb-3">
								{i18n.OPINIONS.OPINIONS_NOT_FOUND}
							</h3>
							<p className="text-sm text-primary/90 leading-relaxed">
								{i18n.OPINIONS.OPINIONS_NOT_FOUND_DESCRIPTION}
							</p>
						</div>
					</div>
				) : (
					<div className="flex flex-col">
						<OpinionLane
							items={lanes.top}
							direction="left"
							dateLocale={dateLocale}
							noCountry={i18n.OPINIONS.OPINIONS_NOT_FOUND_COUNTRY}
						/>
						<OpinionLane
							items={lanes.bottom}
							direction="right"
							dateLocale={dateLocale}
							noCountry={i18n.OPINIONS.OPINIONS_NOT_FOUND_COUNTRY}
						/>
					</div>
				)}
			</div>
		</div>
	);
};
