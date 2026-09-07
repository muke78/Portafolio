import { MessageSquareText, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SendOpinions } from "@/features/opinions/sendOpinions";
import type { PropsLang } from "@/types/currentLang.interface";

/**
 * Floating "leave a comment" widget - bottom-right FAB (like a
 * WhatsApp/chat launcher) that opens an inline panel in place,
 * instead of navigating to a separate page.
 */
export const CommentWidget = ({ currentLocale }: PropsLang) => {
	const [open, setOpen] = useState(false);
	const panelRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		const onOpenRequest = () => setOpen(true);
		window.addEventListener("khelde:open-comment-widget", onOpenRequest);
		return () =>
			window.removeEventListener("khelde:open-comment-widget", onOpenRequest);
	}, []);

	useEffect(() => {
		if (!open) return;
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setOpen(false);
				triggerRef.current?.focus();
			}
		};
		document.addEventListener("keydown", onKeyDown);
		const firstField = panelRef.current?.querySelector<HTMLElement>(
			"input, textarea, select",
		);
		firstField?.focus();
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [open]);

	return (
		<div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
			{open && (
				<div
					ref={panelRef}
					role="dialog"
					aria-modal="true"
					aria-label="Dejar un comentario"
					className="w-[min(92vw,380px)] max-h-[min(80vh,640px)] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl anim-zoom-in"
				>
					<SendOpinions
						currentLocale={currentLocale}
						onClose={() => setOpen(false)}
					/>
				</div>
			)}

			<button
				ref={triggerRef}
				type="button"
				onClick={() => setOpen((v) => !v)}
				aria-expanded={open}
				aria-label={
					open ? "Cerrar formulario de comentario" : "Dejar un comentario"
				}
				className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
			>
				{open ? <X size={24} /> : <MessageSquareText size={24} />}
			</button>
		</div>
	);
};
