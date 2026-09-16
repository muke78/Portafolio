import { Plus, RefreshCw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResourceFieldInput } from "@/features/admin/ResourceFieldInput";
import {
	buildSubmitPayload,
	draftFromItem,
	emptyDraft,
	RESOURCE_CONFIG,
	type Resource,
	type TranslationDraft,
} from "@/features/admin/resourceFields";
import { LOCALE_META, LOCALES } from "@/i18n/locales";

interface ResourceEditorProps {
	resource: Resource;
}

// biome-ignore lint/suspicious/noExplicitAny: item shape comes from an external, admin-proxied backend
type Item = Record<string, any>;

export const ResourceEditor = ({ resource }: ResourceEditorProps) => {
	const config = RESOURCE_CONFIG[resource];
	const [contentLocale, setContentLocale] = useState<string>("es");
	const [editLocale, setEditLocale] = useState<string>("es");
	const [items, setItems] = useState<Item[]>([]);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [draft, setDraft] = useState<{
		main: Record<string, unknown>;
		translations: TranslationDraft;
	}>(emptyDraft(resource));
	const [editingId, setEditingId] = useState<string | number | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(
				`/api/admin/resource?resource=${resource}&currentLocale=${contentLocale}`,
			);
			if (!res.ok) throw new Error(`${res.status}`);
			const body = await res.json();
			if (config.singleton) {
				const item = body?.data ?? null;
				setDraft(
					item
						? draftFromItem(resource, contentLocale, item)
						: emptyDraft(resource),
				);
			} else {
				const rows = body?.data ?? [];
				setItems(Array.isArray(rows) ? rows : []);
			}
			// biome-ignore lint/suspicious/noExplicitAny: caught error is untyped by nature
		} catch (e: any) {
			setError(`No se pudo cargar: ${e.message ?? e}`);
		} finally {
			setLoading(false);
		}
	}, [resource, contentLocale, config.singleton]);

	useEffect(() => {
		load();
		if (!config.singleton) {
			setDraft(emptyDraft(resource));
			setEditingId(null);
		}
		setEditLocale("es");
	}, [load, resource, config.singleton]);

	const updateMain = (key: string, value: unknown) => {
		setDraft((prev) => ({ ...prev, main: { ...prev.main, [key]: value } }));
	};

	const updateTranslation = (locale: string, key: string, value: unknown) => {
		setDraft((prev) => ({
			...prev,
			translations: {
				...prev.translations,
				[locale]: { ...prev.translations[locale], [key]: value },
			},
		}));
	};

	const missingRequired = config.fields
		.filter((f) => f.required)
		.filter((f) => {
			const v = draft.main[f.key];
			return v === undefined || v === null || v === "";
		});

	const save = async () => {
		setError(null);
		if (missingRequired.length > 0) {
			setError(
				`Faltan campos obligatorios: ${missingRequired.map((f) => f.label).join(", ")}`,
			);
			return;
		}
		setSaving(true);
		const payload = buildSubmitPayload(resource, draft);
		const isEdit = config.singleton || editingId !== null;
		const url =
			isEdit && !config.singleton
				? `/api/admin/resource?resource=${resource}&id=${editingId}&currentLocale=${contentLocale}`
				: `/api/admin/resource?resource=${resource}&currentLocale=${contentLocale}`;
		try {
			const res = await fetch(url, {
				method: isEdit ? "PUT" : "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			if (!res.ok) {
				const body = await res.json().catch(() => null);
				setError(body?.message ?? `Error ${res.status}`);
				return;
			}
			if (!config.singleton) {
				setDraft(emptyDraft(resource));
				setEditingId(null);
			}
			load();
		} finally {
			setSaving(false);
		}
	};

	const remove = async (id: string | number) => {
		if (!confirm("¿Eliminar? Esta acción no se puede deshacer.")) return;
		const res = await fetch(
			`/api/admin/resource?resource=${resource}&id=${id}&currentLocale=${contentLocale}`,
			{ method: "DELETE" },
		);
		if (!res.ok) {
			setError(`Error eliminando ${res.status}`);
			return;
		}
		load();
	};

	const edit = (item: Item) => {
		setEditingId(item[config.idKey] ?? null);
		setDraft(draftFromItem(resource, contentLocale, item));
		setEditLocale(contentLocale);
	};

	const cancelEdit = () => {
		setEditingId(null);
		setDraft(emptyDraft(resource));
	};

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between gap-4">
				<h1 className="text-xl font-semibold">{config.label}</h1>
				<div className="flex items-center gap-2">
					<Select value={contentLocale} onValueChange={setContentLocale}>
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
					<Button type="button" variant="ghost" size="sm" onClick={load}>
						<RefreshCw size={16} />
					</Button>
				</div>
			</div>

			<section className="rounded-xl border border-border bg-card p-5">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-semibold">
						{config.singleton
							? "Editar"
							: editingId !== null
								? `Editar #${editingId}`
								: "Crear nuevo"}
					</h2>
					{!config.singleton && editingId !== null && (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={cancelEdit}
						>
							Cancelar
						</Button>
					)}
				</div>

				{config.fields.length > 0 && (
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
						{config.fields.map((field) => (
							<div
								key={field.key}
								className={
									field.type === "textarea" || field.type === "tags"
										? "sm:col-span-2"
										: ""
								}
							>
								<ResourceFieldInput
									id={`main-${field.key}`}
									field={field}
									value={draft.main[field.key]}
									onChange={updateMain}
								/>
							</div>
						))}
					</div>
				)}

				<Tabs
					value={editLocale}
					onValueChange={(v) => setEditLocale(String(v))}
				>
					<TabsList>
						{LOCALES.map((l) => (
							<TabsTrigger key={l} value={l}>
								{LOCALE_META[l].label}
							</TabsTrigger>
						))}
					</TabsList>
					{LOCALES.map((l) => (
						<TabsContent key={l} value={l}>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
								{config.translationFields.map((field) => (
									<div
										key={field.key}
										className={field.type === "textarea" ? "sm:col-span-2" : ""}
									>
										<ResourceFieldInput
											id={`t-${l}-${field.key}`}
											field={field}
											value={draft.translations[l]?.[field.key]}
											onChange={(key, value) =>
												updateTranslation(l, key, value)
											}
										/>
									</div>
								))}
							</div>
						</TabsContent>
					))}
				</Tabs>

				<div className="flex justify-end mt-4">
					<Button type="button" onClick={save} disabled={saving}>
						{!config.singleton && <Plus size={16} />}
						{saving
							? "Guardando..."
							: config.singleton
								? "Guardar"
								: editingId !== null
									? "Guardar"
									: "Crear"}
					</Button>
				</div>
				{error && <p className="text-destructive text-sm mt-3">{error}</p>}
			</section>

			{!config.singleton && (
				<section className="rounded-xl border border-border bg-card p-5">
					<h2 className="text-lg font-semibold mb-4">Lista ({items.length})</h2>
					{loading ? (
						<div className="flex flex-col gap-2">
							{[0, 1, 2].map((i) => (
								<Skeleton key={i} className="h-14 w-full rounded-lg" />
							))}
						</div>
					) : items.length === 0 ? (
						<p className="text-muted-foreground text-sm">Sin datos</p>
					) : (
						<ul className="flex flex-col gap-2 max-h-[60vh] overflow-auto">
							{items.map((item) => {
								const id = item[config.idKey];
								return (
									<li
										key={String(id)}
										className="flex items-center justify-between border border-border rounded-lg px-4 py-2 hover:bg-muted"
									>
										<div className="flex-1 min-w-0">
											<p className="font-medium truncate">
												{item[config.titleKey] ?? `#${id}`}
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
												onClick={() => remove(id)}
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
			)}
		</div>
	);
};
