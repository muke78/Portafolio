import { Quote } from "lucide-react";
import { CountryFlag } from "@/features/opinions/Items/CountryFlag";
import type { Testimonial } from "@/types/currentLang.interface";

interface OpinionCardProps {
	testimonial: Testimonial;
	/** BCP 47 tag used to write the date. */
	dateLocale: string;
	/** Shown when the author did not say where they write from. */
	noCountry: string;
	/**
	 * A repeated card only exists to close the loop: hidden from assistive
	 * technology and out of the tab order, so each opinion is read once.
	 */
	repeat?: boolean;
}

export const OpinionCard = ({
	testimonial,
	dateLocale,
	noCountry,
	repeat = false,
}: OpinionCardProps) => (
	// biome-ignore lint/a11y/useSemanticElements: <fieldset> brings its own default border/padding UA styling that would fight this card's design - role=group keeps the semantics without it
	<div
		role="group"
		tabIndex={repeat ? -1 : 0}
		aria-hidden={repeat ? true : undefined}
		aria-label={`${testimonial.name}: ${testimonial.description}`}
		data-repeat={repeat ? "" : undefined}
		className="group relative w-[340px] shrink-0 rounded-xl bg-card border border-border overflow-hidden hover-lift [contain:layout_paint] focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 motion-reduce:data-[repeat]:hidden"
	>
		<div className="flex flex-col p-6">
			<div className="flex items-start justify-between mb-4">
				<div className="flex-shrink-0 rounded-lg bg-muted p-2">
					<Quote className="w-6 h-6 text-primary" />
				</div>

				<div className="inline-flex items-center rounded-full border border-border text-muted-foreground text-xs font-mono px-2.5 py-0.5">
					{new Date(testimonial.created_at).toLocaleDateString(dateLocale, {
						day: "numeric",
						month: "short",
						year: "numeric",
					})}
				</div>
			</div>

			<div className="flex items-center gap-3 mb-4">
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-1">
						<h3 className="font-medium text-foreground text-base leading-tight truncate">
							{testimonial.name}
						</h3>
						<CountryFlag countryCode={testimonial.country_flag} size="1em" />
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
					<CountryFlag countryCode={testimonial.country_flag} size="1em" />
					<span className="text-sm">
						{testimonial.country ? testimonial.country : noCountry}
					</span>
				</div>
			</div>
		</div>
	</div>
);
