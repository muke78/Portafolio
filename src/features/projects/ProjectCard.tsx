import { ArrowUpRight } from "lucide-react";
import { getI18N } from "@/i18n";
import { mediaUrl } from "@/lib/media";
import { techIconUrl } from "@/lib/techIcon";
import type { Projects, PropsLang } from "@/types/currentLang.interface";

interface ProjectCardProps extends PropsLang {
	project: Projects;
	categoryLabel: string;
}

/**
 * Tarjeta de proyecto (UI_STANDARDS 5.3): 1 titulo en serif, 2 categoria y etiquetas,
 * 3 resumen (3 lineas), 4 stack en iconos redondos tras un filete. El espacio dentro de
 * un grupo es menor que entre grupos. Toda la tarjeta es el area de clic (el enlace del
 * titulo la cubre con `after:`).
 *
 * Sin estado ni animacion propia: la imagen se carga diferida y el fondo `bg-muted` ocupa
 * su lugar, asi una pagina con decenas de tarjetas no paga nada hasta que se acercan.
 */
export const ProjectCard = ({
	currentLocale,
	project,
	categoryLabel,
}: ProjectCardProps) => {
	const i18n = getI18N({ currentLocale });
	const { slug, card_image, images_topics, title, summary, description } =
		project;

	return (
		<article className="relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card hover-lift">
			<figure className="aspect-[2/1] overflow-hidden bg-muted">
				<img
					src={mediaUrl(card_image)}
					alt=""
					width={800}
					height={400}
					loading="lazy"
					decoding="async"
					draggable="false"
					className="size-full object-cover"
				/>
			</figure>

			<div className="flex flex-1 flex-col p-6">
				<p className="eyebrow flex flex-wrap items-center gap-x-3 gap-y-1">
					{categoryLabel}
					{project.featured && (
						<span className="inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
							{i18n.PROJECTS.PROJECTS_BADGE_FEATURED}
						</span>
					)}
					{project.fork && (
						<span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs font-medium text-foreground">
							{i18n.PROJECTS.PROJECTS_BADGE_FORK}
						</span>
					)}
				</p>

				<h4 className="font-serif-display text-heading mt-2">
					<a
						href={`/${currentLocale}/project/${slug}`}
						className="inline-flex items-start gap-1.5 rounded-sm after:absolute after:inset-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
					>
						{title}
						<ArrowUpRight
							size={20}
							aria-hidden="true"
							className="mt-1 shrink-0 text-muted-foreground"
						/>
					</a>
				</h4>

				<p className="mt-3 line-clamp-3 text-base leading-relaxed text-muted-foreground">
					{summary || description}
				</p>

				<ul
					className="mt-auto flex -space-x-2 border-t border-border pt-5"
					aria-label={i18n.PROJECT_DETAIL.STACK}
				>
					{images_topics.map((topic) => (
						<li
							key={topic}
							title={topic}
							className="size-9 overflow-hidden rounded-full border-2 border-card bg-muted"
						>
							<img
								src={techIconUrl(topic)}
								alt={topic}
								width={36}
								height={36}
								loading="lazy"
								decoding="async"
								draggable="false"
								className="size-full"
							/>
						</li>
					))}
				</ul>
			</div>
		</article>
	);
};
