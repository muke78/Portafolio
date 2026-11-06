import { ArrowUpRight } from "lucide-react";
import { getI18N } from "@/i18n";
import { mediaUrl } from "@/lib/media";
import type { Projects, PropsLang } from "@/types/currentLang.interface";

interface ProjectRowProps extends PropsLang {
	project: Projects;
}

/**
 * Una fila del indice de «Ver N mas»: titulo grande en serif, un resumen de una linea y
 * la flecha. UNA accion (toda la fila es el enlace al detalle). Las filas se leen de un
 * vistazo: nadie recibe doce tarjetas de golpe.
 *
 * Con raton (`hover: hover`) la imagen grande aparece junto al cursor y lo sigue (motor:
 * `lib/motion/peek.ts`, atributos `data-peek-*`); con teclado, aparece al enfocar la fila.
 * En tactil, que no tiene hover, cada fila lleva una miniatura. La imagen es decorativa
 * (`alt=""`): el titulo ya dice de que trata, y entra entera, sin zoom.
 */
export const ProjectRow = ({ currentLocale, project }: ProjectRowProps) => {
	const i18n = getI18N({ currentLocale });
	const { slug, card_image, title, summary, description, images_topics } =
		project;

	return (
		<li data-peek-row className="relative border-t border-border">
			<a
				href={`/${currentLocale}/project/${slug}`}
				className="group flex items-center gap-4 py-5 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:gap-8 md:py-6"
			>
				<img
					src={mediaUrl(card_image)}
					alt=""
					width={112}
					height={70}
					loading="lazy"
					decoding="async"
					draggable="false"
					className="h-[70px] w-28 shrink-0 rounded-lg object-cover [@media(hover:hover)_and_(min-width:768px)]:hidden"
				/>
				<span className="min-w-0 flex-1">
					<span className="font-serif-display text-heading block md:text-subtitle">
						{title}
					</span>
					<span className="mt-1 block truncate text-sm text-muted-foreground md:text-base">
						{summary || description}
					</span>
				</span>
				<span
					className="eyebrow hidden shrink-0 lg:block"
					title={images_topics.join(", ")}
				>
					<span className="sr-only">{i18n.PROJECT_DETAIL.STACK}: </span>
					{images_topics.slice(0, 3).join(" · ")}
				</span>
				<ArrowUpRight
					size={24}
					aria-hidden="true"
					className="shrink-0 text-muted-foreground"
				/>
			</a>

			{/* Vista previa grande que sigue al cursor: solo con raton o foco de teclado. */}
			<img
				data-peek-img
				src={mediaUrl(card_image)}
				alt=""
				width={480}
				height={300}
				loading="lazy"
				decoding="async"
				draggable="false"
				className="pointer-events-none invisible absolute top-0 left-0 z-20 hidden aspect-[16/10] w-[min(30rem,40vw)] rounded-xl border border-border object-cover opacity-0 md:block"
			/>
		</li>
	);
};
