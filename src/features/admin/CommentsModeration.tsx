import { Check, EyeOff, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type CommentStatus = "pending" | "published" | "hidden";

interface Comment {
	comment_id: number;
	name: string;
	job: string | null;
	description: string;
	country: string;
	created_at: string;
	status: CommentStatus;
}

const STATUS_LABEL: Record<CommentStatus, string> = {
	pending: "Pendiente",
	published: "Publicado",
	hidden: "Oculto",
};

const STATUS_VARIANT: Record<
	CommentStatus,
	"default" | "secondary" | "outline"
> = {
	pending: "secondary",
	published: "default",
	hidden: "outline",
};

export const CommentsModeration = () => {
	const [items, setItems] = useState<Comment[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch("/api/admin/resource?resource=comments");
			if (!res.ok) throw new Error(`${res.status}`);
			const body = await res.json();
			const rows = body?.data ?? [];
			setItems(Array.isArray(rows) ? rows : []);
			// biome-ignore lint/suspicious/noExplicitAny: caught error is untyped by nature
		} catch (e: any) {
			setError(`No se pudo cargar: ${e.message ?? e}`);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	const setStatus = async (id: number, status: CommentStatus) => {
		const res = await fetch(`/api/admin/resource?resource=comments&id=${id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ status }),
		});
		if (!res.ok) {
			setError(`Error ${res.status}`);
			return;
		}
		load();
	};

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between gap-4">
				<h1 className="text-xl font-semibold">Opiniones</h1>
				<Button type="button" variant="ghost" size="sm" onClick={load}>
					<RefreshCw size={16} />
				</Button>
			</div>

			<section className="rounded-xl border border-border bg-card p-5">
				{loading ? (
					<div className="flex flex-col gap-2">
						{[0, 1, 2].map((i) => (
							<Skeleton key={i} className="h-20 w-full rounded-lg" />
						))}
					</div>
				) : items.length === 0 ? (
					<p className="text-muted-foreground text-sm">Sin comentarios</p>
				) : (
					<ul className="flex flex-col gap-3">
						{items.map((item) => (
							<li
								key={item.comment_id}
								className="flex flex-col gap-2 border border-border rounded-lg p-4"
							>
								<div className="flex items-center justify-between gap-2">
									<div className="flex items-center gap-2">
										<p className="font-medium">{item.name}</p>
										{item.job && (
											<span className="text-xs text-muted-foreground">
												{item.job}
											</span>
										)}
										<Badge variant={STATUS_VARIANT[item.status]}>
											{STATUS_LABEL[item.status]}
										</Badge>
									</div>
									<span className="text-xs text-muted-foreground">
										{new Date(item.created_at).toLocaleString()}
									</span>
								</div>
								<p className="text-sm">{item.description}</p>
								<div className="flex gap-2 justify-end">
									{item.status !== "published" && (
										<Button
											type="button"
											variant="outline"
											size="xs"
											onClick={() => setStatus(item.comment_id, "published")}
										>
											<Check size={12} /> Aprobar
										</Button>
									)}
									{item.status !== "hidden" && (
										<Button
											type="button"
											variant="outline"
											size="xs"
											className="text-destructive border-destructive/30 hover:bg-destructive/10"
											onClick={() => setStatus(item.comment_id, "hidden")}
										>
											<EyeOff size={12} /> Ocultar
										</Button>
									)}
								</div>
							</li>
						))}
					</ul>
				)}
				{error && <p className="text-destructive text-sm mt-3">{error}</p>}
			</section>
		</div>
	);
};
