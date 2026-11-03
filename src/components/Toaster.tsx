import { CircleAlert, CircleCheck, X } from "lucide-react";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Avisos que aparecen un momento (enviado / error). Reemplaza a react-hot-toast, que
 * inyecta su CSS en una etiqueta <style> en tiempo de ejecucion: un CSP con hashes
 * (`security.csp`) no puede permitirlo. Esta version solo usa clases de Tailwind, asi
 * que no escribe estilos en la pagina.
 */
type Kind = "success" | "error";
interface ToastItem {
	id: number;
	kind: Kind;
	message: string;
}

let toasts: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const timers = new Map<number, ReturnType<typeof setTimeout>>();

const emit = () => {
	for (const listener of listeners) listener();
};

const dismiss = (id: number) => {
	clearTimeout(timers.get(id));
	timers.delete(id);
	toasts = toasts.filter((t) => t.id !== id);
	emit();
};

const show = (kind: Kind, message: string, duration = 5000) => {
	const id = nextId++;
	toasts = [...toasts, { id, kind, message }];
	timers.set(
		id,
		setTimeout(() => dismiss(id), duration),
	);
	emit();
	return id;
};

export const toast = {
	success: (message: string, options?: { duration?: number }) =>
		show("success", message, options?.duration),
	error: (message: string, options?: { duration?: number }) =>
		show("error", message, options?.duration),
	dismiss,
	/** Quita todos (las pruebas lo usan entre un caso y otro). */
	remove: () => {
		for (const timer of timers.values()) clearTimeout(timer);
		timers.clear();
		toasts = [];
		emit();
	},
};

const subscribe = (notify: () => void) => {
	listeners.add(notify);
	return () => {
		listeners.delete(notify);
	};
};
const getSnapshot = () => toasts;
const getServerSnapshot = (): ToastItem[] => [];

export const Toaster = ({ closeLabel }: { closeLabel: string }) => {
	const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
	return (
		<div className="pointer-events-none fixed right-4 bottom-4 z-100 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
			{items.map((item) => (
				<div
					key={item.id}
					// Un error interrumpe (alert); un exito solo se anuncia (status).
					role={item.kind === "error" ? "alert" : "status"}
					className={cn(
						"pointer-events-auto flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm text-card-foreground shadow-lg motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2",
						item.kind === "error" && "border-destructive/50",
					)}
				>
					{item.kind === "error" ? (
						<CircleAlert
							aria-hidden="true"
							className="mt-0.5 size-4 shrink-0 text-destructive"
						/>
					) : (
						<CircleCheck
							aria-hidden="true"
							className="mt-0.5 size-4 shrink-0 text-primary"
						/>
					)}
					<p className="min-w-0 flex-1 break-words">{item.message}</p>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="-my-1 -mr-2 size-8 shrink-0"
						aria-label={closeLabel}
						onClick={() => dismiss(item.id)}
					>
						<X aria-hidden="true" className="size-4" />
					</Button>
				</div>
			))}
		</div>
	);
};
