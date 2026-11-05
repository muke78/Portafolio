import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
	type KeyboardEvent,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { cn } from "@/lib/utils";

export interface GalleryImage {
	src: string;
	alt: string;
}

export interface GalleryLabels {
	/** Nombre del carrusel para lectores de pantalla. */
	gallery: string;
	previous: string;
	next: string;
	/** "Imagen {n} de {total}" */
	count: string;
	/** "Ir a la imagen {n}" */
	goTo: string;
	open: string;
	close: string;
}

interface Props {
	images: readonly GalleryImage[];
	labels: GalleryLabels;
}

const fill = (template: string, values: Record<string, number>) =>
	template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));

const useReducedMotion = () => {
	const [reduced, setReduced] = useState(false);
	useEffect(() => {
		const query = window.matchMedia("(prefers-reduced-motion: reduce)");
		const sync = () => setReduced(query.matches);
		sync();
		query.addEventListener("change", sync);
		return () => query.removeEventListener("change", sync);
	}, []);
	return reduced;
};

const arrow =
	"absolute top-1/2 z-10 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/85 text-foreground backdrop-blur-sm hover-press focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-40";

/**
 * Carrusel de la pagina de un proyecto: la imagen de la tarjeta y la galeria, completas
 * (`object-contain`, sin recorte ni zoom), con flechas, miniaturas, deslizamiento tactil
 * (scroll-snap nativo), teclado y un visor a pantalla completa (`<dialog>`).
 *
 * Sin JS se ve la primera imagen; con una sola imagen no hay flechas ni miniaturas.
 * Todo el movimiento es el del navegador (scroll suave), apagado con `prefers-reduced-motion`.
 */
export const ProjectGallery = ({ images, labels }: Props) => {
	const total = images.length;
	const [index, setIndex] = useState(0);
	const [open, setOpen] = useState(false);
	const scroller = useRef<HTMLUListElement>(null);
	const dialog = useRef<HTMLDialogElement>(null);
	const frame = useRef(0);
	const reducedMotion = useReducedMotion();

	const go = useCallback(
		(next: number) => {
			const target = Math.min(Math.max(next, 0), total - 1);
			setIndex(target);
			const el = scroller.current;
			if (el) {
				el.scrollTo({
					left: target * el.clientWidth,
					behavior: reducedMotion ? "auto" : "smooth",
				});
			}
		},
		[total, reducedMotion],
	);

	// El indice sigue al deslizamiento (dedo, rueda o teclado nativo).
	const onScroll = () => {
		cancelAnimationFrame(frame.current);
		frame.current = requestAnimationFrame(() => {
			const el = scroller.current;
			if (el && el.clientWidth > 0) {
				setIndex(Math.round(el.scrollLeft / el.clientWidth));
			}
		});
	};
	useEffect(() => () => cancelAnimationFrame(frame.current), []);

	const onKeyDown = (event: KeyboardEvent) => {
		if (event.key === "ArrowRight") {
			event.preventDefault();
			go(index + 1);
		} else if (event.key === "ArrowLeft") {
			event.preventDefault();
			go(index - 1);
		}
	};

	// Visor: el `<dialog>` nativo da el foco, Escape y el fondo inerte.
	useEffect(() => {
		const el = dialog.current;
		if (!el) return;
		if (open && !el.open && typeof el.showModal === "function") el.showModal();
		if (!open && el.open) el.close();
	}, [open]);

	const many = total > 1;
	const current = images[index] ?? images[0];
	if (!current) return null;

	return (
		<section aria-roledescription="carrusel" aria-label={labels.gallery}>
			<div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-muted shadow-[var(--glow)]">
				<ul
					ref={scroller}
					onScroll={onScroll}
					onKeyDown={onKeyDown}
					// El teclado entra por el boton de la imagen actual (la unica con tabindex 0):
					// asi la region que se desplaza ya es alcanzable y las flechas llegan aqui.
					aria-label={labels.gallery}
					className="flex size-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary [&::-webkit-scrollbar]:hidden"
				>
					{images.map((image, i) => (
						<li
							key={image.src}
							aria-roledescription="diapositiva"
							aria-label={fill(labels.count, { n: i + 1, total })}
							className="size-full shrink-0 snap-center"
						>
							<button
								type="button"
								onClick={() => {
									setIndex(i);
									setOpen(true);
								}}
								aria-label={`${labels.open}: ${image.alt}`}
								className="block size-full cursor-zoom-in"
								tabIndex={i === index ? 0 : -1}
							>
								<img
									src={image.src}
									alt={image.alt}
									width={1240}
									height={698}
									// La primera es el LCP de la pagina; el resto espera a que se acerque.
									loading={i === 0 ? "eager" : "lazy"}
									fetchPriority={i === 0 ? "high" : "auto"}
									decoding="async"
									draggable="false"
									className="size-full object-contain"
								/>
							</button>
						</li>
					))}
				</ul>

				{many ? (
					<>
						<button
							type="button"
							onClick={() => go(index - 1)}
							disabled={index === 0}
							aria-label={labels.previous}
							className={cn(arrow, "left-3")}
						>
							<ChevronLeft aria-hidden="true" className="size-5" />
						</button>
						<button
							type="button"
							onClick={() => go(index + 1)}
							disabled={index === total - 1}
							aria-label={labels.next}
							className={cn(arrow, "right-3")}
						>
							<ChevronRight aria-hidden="true" className="size-5" />
						</button>
						<p
							aria-live="polite"
							className="eyebrow absolute right-3 bottom-3 rounded-full border border-border bg-background/85 px-3 py-1 backdrop-blur-sm"
						>
							{index + 1} / {total}
						</p>
					</>
				) : null}
			</div>

			{many ? (
				<ul className="mt-4 flex gap-3 overflow-x-auto pb-1">
					{images.map((image, i) => (
						<li key={image.src} className="shrink-0">
							<button
								type="button"
								onClick={() => go(i)}
								aria-label={fill(labels.goTo, { n: i + 1 })}
								aria-current={i === index ? "true" : undefined}
								className={cn(
									"block h-14 w-24 overflow-hidden rounded-lg border bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:h-16 sm:w-28",
									i === index
										? "border-primary"
										: "border-border opacity-70 hover:opacity-100",
								)}
							>
								<img
									src={image.src}
									alt=""
									width={112}
									height={64}
									loading="lazy"
									decoding="async"
									draggable="false"
									className="size-full object-cover"
								/>
							</button>
						</li>
					))}
				</ul>
			) : null}

			<dialog
				ref={dialog}
				aria-label={current.alt}
				onClose={() => setOpen(false)}
				onClick={(event) => {
					// Un clic en el fondo (no en la imagen ni en los botones) cierra.
					if (event.target === dialog.current) setOpen(false);
				}}
				onKeyDown={onKeyDown}
				className="m-auto max-h-svh max-w-[100vw] bg-transparent p-0 text-foreground backdrop:bg-background/90"
			>
				{open ? (
					<div className="relative flex max-h-svh max-w-[100vw] items-center justify-center p-4 sm:p-8">
						<img
							src={current.src}
							alt={current.alt}
							className="max-h-[88svh] max-w-full rounded-lg object-contain"
						/>
						<button
							type="button"
							onClick={() => setOpen(false)}
							aria-label={labels.close}
							className={cn(
								arrow,
								"top-4 right-4 left-auto translate-y-0 sm:top-8 sm:right-8",
							)}
						>
							<X aria-hidden="true" className="size-5" />
						</button>
						{many ? (
							<>
								<button
									type="button"
									onClick={() => go(index - 1)}
									disabled={index === 0}
									aria-label={labels.previous}
									className={cn(arrow, "left-4 sm:left-8")}
								>
									<ChevronLeft aria-hidden="true" className="size-5" />
								</button>
								<button
									type="button"
									onClick={() => go(index + 1)}
									disabled={index === total - 1}
									aria-label={labels.next}
									className={cn(arrow, "right-4 sm:right-8")}
								>
									<ChevronRight aria-hidden="true" className="size-5" />
								</button>
							</>
						) : null}
					</div>
				) : null}
			</dialog>
		</section>
	);
};
