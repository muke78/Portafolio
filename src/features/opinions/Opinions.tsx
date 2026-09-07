import { Loader2, MessageSquare, Quote } from "lucide-react";
import { type CSSProperties, useEffect, useState } from "react";
import { getI18N } from "@/i18n";
import type {
	PropsLangWithOpinions,
	Testimonial,
} from "@/types/currentLang.interface";
import { CountryFlag } from "@/features/opinions/Items/CountryFlag";

export const Opinions = ({
	currentLocale,
	initialData = [],
}: PropsLangWithOpinions) => {
	const [data, setData] = useState<Testimonial[]>(initialData);
	const [loading, setLoading] = useState<boolean>(initialData.length === 0);
	const i18n = getI18N({ currentLocale });

	useEffect(() => {
		if (initialData.length > 0) return;
		async function fetchData() {
			try {
				const result = await fetch("/api/comments");
				const comments = await result.json();
				setData(comments.data as Testimonial[]);
			} catch (error) {
				console.error("Error al cargar comentarios:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchData();
	}, [initialData.length]);

	if (loading)
		return (
			<Loader2
				className="animate-spin text-primary"
				size={40}
				aria-label="Cargando"
			/>
		);

	return (
		<div className="relative w-full overflow-hidden">
			<div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-14 px-4 anim-fade-in">
				<span className="eyebrow mb-4">
					— {i18n.OPINIONS.OPINIONS_SUBTITLE}
				</span>

				<h2 className="font-serif-display text-[clamp(32px,4.5vw,56px)] mb-4">
					{i18n.OPINIONS.OPINIONS_TITLE}
				</h2>

				<p className="text-lg text-muted-foreground mb-7">
					{i18n.OPINIONS.OPINIONS_SUB_SUBTILE}
				</p>

				<button
					type="button"
					className="inline-flex items-center justify-center h-11 px-5 rounded-full gap-2 bg-primary text-primary-foreground text-sm font-medium transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
					onClick={() =>
						window.dispatchEvent(new CustomEvent("khelde:open-comment-widget"))
					}
					aria-label={i18n.OPINIONS.OPINIONS_REDIRECT_COMMENTS_PAGE}
				>
					<MessageSquare className="w-4 h-4" />
					{i18n.OPINIONS.OPINIONS_REDIRECT_COMMENTS_PAGE}
				</button>
			</div>

			<div>
				{data.length === 0 ? (
					<div
						className="flex flex-col items-center justify-center min-h-[400px] px-8 py-12 anim-fade-in"
						aria-live="polite"
					>
						<div className="relative mb-8">
							<img
								src="/no_data.svg"
								alt="No hay información disponible"
								aria-label="No hay información disponible por el momento"
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
					<div
						className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]"
						style={
							{
								"--marquee-duration": `${Math.max(50, data.length * 14)}s`,
							} as CSSProperties
						}
					>
						<div className="flex w-max gap-6 py-4 motion-safe:[animation:testimonial-marquee_var(--marquee-duration)_linear_infinite] hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]">
							{[...data, ...data].map((testimonial, i) => (
								<div
									key={`${testimonial.comment_id}-${i}`}
									tabIndex={0}
									aria-label={`${testimonial.name}: ${testimonial.description}`}
									className="group relative w-[340px] shrink-0 rounded-xl bg-card border border-border overflow-hidden transition-colors hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
								>
									<div className="flex flex-col p-6">
										<div className="flex items-start justify-between mb-4">
											<div className="flex-shrink-0 rounded-lg bg-muted p-2">
												<Quote className="w-6 h-6 text-primary" />
											</div>

											<div className="inline-flex items-center rounded-full border border-border text-muted-foreground text-xs font-mono px-2.5 py-0.5">
												{new Date(testimonial.created_at).toLocaleDateString(
													"es-ES",
													{
														day: "numeric",
														month: "short",
														year: "numeric",
													},
												)}
											</div>
										</div>

										<div className="flex items-center gap-3 mb-4">
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2 mb-1">
													<h3 className="font-medium text-foreground text-base leading-tight truncate">
														{testimonial.name}
													</h3>
													<CountryFlag
														countryCode={testimonial.country_flag}
														size="1em"
													/>
												</div>
												<p className="text-sm text-muted-foreground truncate">
													{testimonial.job}
												</p>
											</div>
										</div>

										<div className="flex-1">
											<p className="text-muted-foreground leading-relaxed text-sm mb-4 line-clamp-4">
												"{testimonial.description}"
											</p>
										</div>

										<div className="flex items-center justify-between pt-4 border-t border-border">
											<div className="flex items-center gap-2 text-xs text-muted-foreground">
												<CountryFlag
													countryCode={testimonial.country_flag}
													size="1em"
												/>
												<span className="text-sm">
													{testimonial.country
														? testimonial.country
														: i18n.OPINIONS.OPINIONS_NOT_FOUND_COUNTRY}
												</span>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
