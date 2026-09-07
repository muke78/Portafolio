import { LogOut, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

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
		<div className="min-h-screen bg-base-300 text-base-content">
			<header className="border-b border-base-content/10 bg-base-100">
				<div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
					<h1 className="text-xl font-semibold">Admin · Khelde</h1>
					<button
						type="button"
						className="btn btn-sm btn-outline gap-2"
						onClick={logout}
					>
						<LogOut size={16} /> Salir
					</button>
				</div>
			</header>

			<div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6">
				<aside className="flex lg:flex-col gap-2">
					{RESOURCES.map((r) => (
						<button
							key={r.key}
							type="button"
							onClick={() => setActive(r.key)}
							className={`btn justify-start ${
								active === r.key ? "btn-primary" : "btn-ghost"
							}`}
						>
							{r.label}
						</button>
					))}
				</aside>

				<main className="flex flex-col gap-6">
					<section className="card bg-base-100 p-5">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-lg font-semibold">
								{editingId !== null ? `Editar #${editingId}` : "Crear nuevo"}
							</h2>
							<div className="flex gap-2">
								<button
									type="button"
									className="btn btn-sm btn-ghost gap-2"
									onClick={load}
								>
									<RefreshCw size={16} />
								</button>
								{editingId !== null && (
									<button
										type="button"
										className="btn btn-sm btn-ghost"
										onClick={() => {
											setEditingId(null);
											setDraft("{}");
										}}
									>
										Cancelar
									</button>
								)}
							</div>
						</div>
						<textarea
							className="textarea w-full font-mono text-sm min-h-[260px] bg-base-200"
							value={draft}
							onChange={(e) => setDraft(e.target.value)}
							placeholder='{"title":"...","description":"..."}'
						/>
						<div className="flex justify-end mt-3">
							<button
								type="button"
								className="btn btn-primary gap-2"
								onClick={submit}
							>
								<Plus size={16} />
								{editingId !== null ? "Guardar" : "Crear"}
							</button>
						</div>
						{error && <p className="text-error text-sm mt-3">{error}</p>}
					</section>

					<section className="card bg-base-100 p-5">
						<h2 className="text-lg font-semibold mb-4">
							Lista ({items.length})
						</h2>
						{loading ? (
							<span className="loading loading-ring loading-md" />
						) : items.length === 0 ? (
							<p className="text-base-content/60 text-sm">Sin datos</p>
						) : (
							<ul className="flex flex-col gap-2 max-h-[60vh] overflow-auto">
								{items.map((item) => {
									const id = getId(item);
									const title =
										item?.title ?? item?.name ?? item?.work ?? `#${id ?? "?"}`;
									return (
										<li
											key={String(id)}
											className="flex items-center justify-between border border-base-content/10 rounded-lg px-4 py-2 hover:bg-base-content/5"
										>
											<div className="flex-1 min-w-0">
												<p className="font-medium truncate">{title}</p>
												<p className="text-xs text-base-content/50">
													id: {String(id)}
												</p>
											</div>
											<div className="flex gap-2">
												<button
													type="button"
													className="btn btn-xs btn-outline"
													onClick={() => edit(item)}
												>
													Editar
												</button>
												<button
													type="button"
													className="btn btn-xs btn-error btn-outline gap-1"
													onClick={() => id !== null && remove(id)}
												>
													<Trash2 size={12} />
												</button>
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
