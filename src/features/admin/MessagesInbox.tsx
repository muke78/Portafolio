import { CheckCheck, MailOpen, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type MessageStatus = "unread" | "read" | "replied";

interface ContactMessage {
	message_id: number;
	name: string;
	email: string;
	phone: string;
	more_information: string;
	created_at: string;
	status: MessageStatus;
}

const STATUS_LABEL: Record<MessageStatus, string> = {
	unread: "Sin leer",
	read: "Leído",
	replied: "Respondido",
};

const STATUS_VARIANT: Record<
	MessageStatus,
	"default" | "secondary" | "outline"
> = {
	unread: "default",
	read: "secondary",
	replied: "outline",
};

export const MessagesInbox = () => {
	const [items, setItems] = useState<ContactMessage[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch("/api/admin/resource?resource=contact-messages");
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

	const setStatus = async (id: number, status: MessageStatus) => {
		const res = await fetch(
			`/api/admin/resource?resource=contact-messages&id=${id}`,
			{
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status }),
			},
		);
		if (!res.ok) {
			setError(`Error ${res.status}`);
			return;
		}
		load();
	};

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between gap-4">
				<h1 className="text-xl font-semibold">Mensajes</h1>
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
					<p className="text-muted-foreground text-sm">Sin mensajes</p>
				) : (
					<ul className="flex flex-col gap-3">
						{items.map((item) => (
							<li
								key={item.message_id}
								className="flex flex-col gap-2 border border-border rounded-lg p-4"
							>
								<div className="flex items-center justify-between gap-2">
									<div className="flex items-center gap-2 flex-wrap">
										<p className="font-medium">{item.name}</p>
										<span className="text-xs text-muted-foreground">
											{item.email}
										</span>
										<span className="text-xs text-muted-foreground">
											{item.phone}
										</span>
										<Badge variant={STATUS_VARIANT[item.status]}>
											{STATUS_LABEL[item.status]}
										</Badge>
									</div>
									<span className="text-xs text-muted-foreground">
										{new Date(item.created_at).toLocaleString()}
									</span>
								</div>
								<p className="text-sm">{item.more_information}</p>
								<div className="flex gap-2 justify-end">
									{item.status !== "read" && (
										<Button
											type="button"
											variant="outline"
											size="xs"
											onClick={() => setStatus(item.message_id, "read")}
										>
											<MailOpen size={12} /> Marcar leído
										</Button>
									)}
									{item.status !== "replied" && (
										<Button
											type="button"
											variant="outline"
											size="xs"
											onClick={() => setStatus(item.message_id, "replied")}
										>
											<CheckCheck size={12} /> Marcar respondido
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
