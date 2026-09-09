import { LogOut, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ResourceFieldInput } from "@/features/admin/ResourceFieldInput";
import {
	draftFromItem,
	emptyDraft,
	RESOURCE_FIELDS,
	RESOURCES,
	type Resource,
} from "@/features/admin/resourceFields";
import { LOCALES, LOCALE_META } from "@/i18n/locales";

// biome-ignore lint/suspicious/noExplicitAny: item shape comes from an external, admin-proxied backend
const getId = (item: any): string | number | null =>
	item?.id ??
	item?.project_id ??
	item?.experience_id ??
	item?.comment_id ??
	null;

// biome-ignore lint/suspicious/noExplicitAny: item shape comes from an external, admin-proxied backend
const getTitle = (item: any, id: string | number | null): string =>
	item?.title ?? item?.name ?? item?.work ?? `#${id ?? "?"}`;

export const AdminDashboard = () => {
	const [active, setActive] = useState<Resource>("projects");
	const [locale, setLocale] = useState<string>("es");
	// biome-ignore lint/suspicious/noExplicitAny: item shape comes from an external, admin-proxied backend
	const [items, setItems] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [draft, setDraft] = useState<Record<string, unknown>>(
		emptyDraft(active),
	);
	const [editingId, setEditingId] = useState<string | number | null>(null);

	const fields = useMemo(() => RESOURCE_FIELDS[active], [active]);

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(
				`/api/admin/resource?resource=${active}&currentLocale=${locale}`,
			);
			if (!res.ok) throw new Error(`${res.status}`);
			const data = await res.json();
			const rows = data?.data?.rows ?? data?.data ?? data ?? [];
			setItems(Array.isArray(rows) ? rows : []);
			// biome-ignore lint/suspicious/noExplicitAny: caught error is untyped by nature
		} catch (e: any) {
			setError(`No se pudo cargar: ${e.message ?? e}`);
		} finally {
			setLoading(false);
		}
	}, [active, locale]);

	useEffect(() => {
		load();
		setDraft(emptyDraft(active));
		setEditingId(null);
	}, [load, active]);

	const updateField = (key: string, value: unknown) => {
		setDraft((prev) => ({ ...prev, [key]: value }));
	};

	const missingRequired = fields
		.filter((f) => f.required)
		.filter((f) => {
			const v = draft[f.key];
			return v === undefined || v === null || v === "";
		});

	const submit = async () => {
		setError(null);
		if (missingRequired.length > 0) {
			setError(
				`Faltan campos obligatorios: ${missingRequired.map((f) => f.label).join(", ")}`,
			);
			return;
		}
		const isEdit = editingId !== null;
		const url = isEdit
			? `/api/admin/resource?resource=${active}&id=${editingId}&currentLocale=${locale}`
			: `/api/admin/resource?resource=${active}&currentLocale=${locale}`;
		const res = await fetch(url, {
			method: isEdit ? "PUT" : "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(draft),
		});
		if (!res.ok) {
			setError(`Error ${res.status}`);
			return;
		}
		setDraft(emptyDraft(active));
		setEditingId(null);
		load();
	};

	const remove = async (id: string | number) => {
		if (!confirm("¿Eliminar?")) return;
		const res = await fetch(
			`/api/admin/resource?resource=${active}&id=${id}&currentLocale=${locale}`,
			{ method: "DELETE" },
		);
		if (!res.ok) {
			setError(`Error eliminando ${res.status}`);
			return;
		}
		load();
	};

	// biome-ignore lint/suspicious/noExplicitAny: item shape comes from an external, admin-proxied backend
	const edit = (item: any) => {
		setEditingId(getId(item));
		setDraft(draftFromItem(active, item));
	};

	const logout = async () => {
		await fetch("/api/admin/logout", { method: "POST" });
		window.location.href = "/admin/login";
	};

	return (
		<div className="min-h-screen bg-background text-foreground">
			<header className="border-b border-border bg-card">
				<div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
					<h1 className="text-xl font-semibold">Admin · Khelde</h1>
					<div className="flex items-center gap-3">
						<Select value={locale} onValueChange={setLocale}>
							<SelectTrigger size="sm" className="w-36">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{LOCALES.map((l) => (
									<SelectItem key={l} value={l}>
										{LOCALE_META[l].label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Button type="button" variant="outline" size="sm" onClick={logout}>
							<LogOut size={16} /> Salir
						</Button>
					</div>
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
											setDraft(emptyDraft(active));
										}}
									>
										Cancelar
									</Button>
								)}
							</div>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							{fields.map((field) => (
								<div
									key={field.key}
									className={
										field.type === "textarea" || field.type === "tags"
											? "sm:col-span-2"
											: ""
									}
								>
									<ResourceFieldInput
										id={`field-${field.key}`}
										field={field}
										value={draft[field.key]}
										onChange={updateField}
									/>
								</div>
							))}
						</div>

						<div className="flex justify-end mt-4">
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
							<div className="flex flex-col gap-2">
								{[0, 1, 2].map((i) => (
									// biome-ignore lint/suspicious/noArrayIndexKey: static placeholder count, index is stable
									<Skeleton key={i} className="h-14 w-full rounded-lg" />
								))}
							</div>
						) : items.length === 0 ? (
							<p className="text-muted-foreground text-sm">Sin datos</p>
						) : (
							<ul className="flex flex-col gap-2 max-h-[60vh] overflow-auto">
								{items.map((item) => {
									const id = getId(item);
									return (
										<li
											key={String(id)}
											className="flex items-center justify-between border border-border rounded-lg px-4 py-2 hover:bg-muted"
										>
											<div className="flex-1 min-w-0">
												<p className="font-medium truncate">
													{getTitle(item, id)}
												</p>
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
