import { Loader2, MessageSquare, Quote } from "lucide-react";
import { useEffect, useState } from "react";
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
		<div className="relative w-full overflow-hidden p-4">
			<div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-12 anim-fade-in">
				<div className="inline-block px-4 py-2 bg-primary/20 text-foreground text-sm rounded-full mb-6 backdrop-blur-sm border border-primary/20">
					{i18n.OPINIONS.OPINIONS_SUBTITLE}
				</div>

				<h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
					{i18n.OPINIONS.OPINIONS_TITLE}
				</h2>

				<p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto mb-6">
					{i18n.OPINIONS.OPINIONS_SUB_SUBTILE}
				</p>

				<a
					className="inline-flex items-center justify-center h-9 px-4 rounded-lg gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium transition-opacity hover:opacity-90"
					href={`/${currentLocale}/comments`}
					aria-label={i18n.OPINIONS.OPINIONS_REDIRECT_COMMENTS_PAGE}
				>
					<MessageSquare className="w-5 h-5" />
					{i18n.OPINIONS.OPINIONS_REDIRECT_COMMENTS_PAGE}
				</a>
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
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-6 p-4">
						{data.map((testimonial) => (
							<div
								key={testimonial.comment_id}
								className="group relative break-inside-avoid rounded-xl bg-card shadow-lg border border-border hover:shadow-xl hover:border-secondary/30 hover:-translate-y-2 transition-all duration-500 overflow-hidden anim-fade-in"
							>
								<div className="flex flex-col p-6">
									<div className="flex items-start justify-between mb-4">
										<div className="flex-shrink-0 p-2 rounded-lg bg-secondary/10 group-hover:bg-secondary/20 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 ease-in-out">
											<Quote className="w-8 h-8 text-secondary" />
										</div>

										<div className="inline-flex items-center rounded-full bg-secondary text-secondary-foreground text-xs px-2.5 py-0.5">
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
												<h3 className="font-bold text-foreground text-lg leading-tight truncate">
													{testimonial.name}
												</h3>
												<CountryFlag
													countryCode={testimonial.country_flag}
													size="1em"
												/>
											</div>
											<p className="text-sm text-muted-foreground font-medium truncate">
												{testimonial.job}
											</p>
										</div>
									</div>

									<div className="flex-1">
										<p className="text-muted-foreground leading-relaxed text-sm mb-4">
											"{testimonial.description}"
										</p>
									</div>

									<div className="flex items-center justify-between pt-4 border-t border-border/50">
										<div className="flex items-center gap-2 text-xs text-muted-foreground">
											<CountryFlag
												countryCode={testimonial.country_flag}
												size="1em"
											/>
											<span className="text-muted-foreground text-sm">
												{testimonial.country
													? testimonial.country
													: i18n.OPINIONS.OPINIONS_NOT_FOUND_COUNTRY}
											</span>
										</div>
									</div>
								</div>

								<div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary to-accent scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
								<div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};
