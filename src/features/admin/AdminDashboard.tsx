import { Loader2, LogOut, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Resource = "projects" | "experiences" | "comments";

const RESOURCES: { key: Resource; label: string }[] = [
	{ key: "projects", label: "Proyectos" },
	{ key: "experiences", label: "Experiencias" },
	{ key: "comments", label: "Comentarios" },
];

const getId = (item: any): string | number | null =>
	item?.id ??
	item?.project_id ??
	item?.experience_id ??
	item?.comment_id ??
	null;

export const AdminDashboard = () => {
	const [active, setActive] = useState<Resource>("projects");
	const [items, setItems] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [draft, setDraft] = useState<string>("{}");
	const [editingId, setEditingId] = useState<string | number | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(
				`/api/admin/resource?resource=${active}&currentLocale=es`,
			);
			if (!res.ok) throw new Error(`${res.status}`);
			const data = await res.json();
			const rows = data?.data?.rows ?? data?.data ?? data ?? [];
			setItems(Array.isArray(rows) ? rows : []);
		} catch (e: any) {
			setError(`No se pudo cargar: ${e.message ?? e}`);
		} finally {
			setLoading(false);
		}
	}, [active]);

	useEffect(() => {
		load();
		setDraft("{}");
		setEditingId(null);
	}, [load]);

	const submit = async () => {
		setError(null);
		let body: unknown;
		try {
			body = JSON.parse(draft);
		} catch {
			setError("JSON inválido");
			return;
		}
		const isEdit = editingId !== null;
		const url = isEdit
			? `/api/admin/resource?resource=${active}&id=${editingId}`
			: `/api/admin/resource?resource=${active}`;
		const res = await fetch(url, {
			method: isEdit ? "PUT" : "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});
		if (!res.ok) {
			setError(`Error ${res.status}`);
			return;
		}
		setDraft("{}");
		setEditingId(null);
		load();
	};

	const remove = async (id: string | number) => {
		if (!confirm("¿Eliminar?")) return;
		const res = await fetch(`/api/admin/resource?resource=${active}&id=${id}`, {
			method: "DELETE",
		});
		if (!res.ok) {
			setError(`Error eliminando ${res.status}`);
			return;
		}
		load();
	};

	const edit = (item: any) => {
		const id = getId(item);
		setEditingId(id);
		setDraft(JSON.stringify(item, null, 2));
	};

	const logout = async () => {
		await fetch("/api/admin/logout", { method: "POST" });
		window.location.href = "/admin/login";
	};

	return (
		<div className="min-h-screen bg-background text-foreground">
			<header className="border-b border-border bg-card">
				<div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
					<h1 className="text-xl font-semibold">Admin · Khelde</h1>
					<Button type="button" variant="outline" size="sm" onClick={logout}>
						<LogOut size={16} /> Salir
					</Button>
				</div>
			</header>

			<div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6">
				<aside className="flex lg:flex-col gap-2">
					{RESOURCES.map((r) => (
						<Button
							key={r.key}
							type="button"
							variant={active === r.key ? "default" : "ghost"}
							className="justify-start"
							onClick={() => setActive(r.key)}
						>
							{r.label}
						</Button>
					))}
				</aside>

				<main className="flex flex-col gap-6">
					<section className="rounded-xl border border-border bg-card p-5">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-lg font-semibold">
								{editingId !== null ? `Editar #${editingId}` : "Crear nuevo"}
							</h2>
							<div className="flex gap-2">
								<Button type="button" variant="ghost" size="sm" onClick={load}>
									<RefreshCw size={16} />
								</Button>
								{editingId !== null && (
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={() => {
											setEditingId(null);
											setDraft("{}");
										}}
									>
										Cancelar
									</Button>
								)}
							</div>
						</div>
						<Textarea
							className="font-mono text-sm min-h-[260px] bg-background"
							value={draft}
							onChange={(e) => setDraft(e.target.value)}
							placeholder='{"title":"...","description":"..."}'
						/>
						<div className="flex justify-end mt-3">
							<Button type="button" onClick={submit}>
								<Plus size={16} />
								{editingId !== null ? "Guardar" : "Crear"}
							</Button>
						</div>
						{error && <p className="text-destructive text-sm mt-3">{error}</p>}
					</section>

					<section className="rounded-xl border border-border bg-card p-5">
						<h2 className="text-lg font-semibold mb-4">
							Lista ({items.length})
						</h2>
						{loading ? (
							<Loader2
								className="animate-spin text-primary"
								size={28}
								aria-label="Cargando"
							/>
						) : items.length === 0 ? (
							<p className="text-muted-foreground text-sm">Sin datos</p>
						) : (
							<ul className="flex flex-col gap-2 max-h-[60vh] overflow-auto">
								{items.map((item) => {
									const id = getId(item);
									const title =
										item?.title ?? item?.name ?? item?.work ?? `#${id ?? "?"}`;
									return (
										<li
											key={String(id)}
											className="flex items-center justify-between border border-border rounded-lg px-4 py-2 hover:bg-muted"
										>
											<div className="flex-1 min-w-0">
												<p className="font-medium truncate">{title}</p>
												<p className="text-xs text-muted-foreground">
													id: {String(id)}
												</p>
											</div>
											<div className="flex gap-2">
												<Button
													type="button"
													variant="outline"
													size="xs"
													onClick={() => edit(item)}
												>
													Editar
												</Button>
												<Button
													type="button"
													variant="outline"
													size="xs"
													className="text-destructive border-destructive/30 hover:bg-destructive/10"
													onClick={() => id !== null && remove(id)}
												>
													<Trash2 size={12} />
												</Button>
											</div>
										</li>
									);
								})}
							</ul>
						)}
					</section>
				</main>
			</div>
		</div>
	);
};
