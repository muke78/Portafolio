import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { FieldConfig } from "@/features/admin/resourceFields";

interface ResourceFieldInputProps {
	field: FieldConfig;
	value: unknown;
	onChange: (key: string, value: unknown) => void;
	id: string;
}

export const ResourceFieldInput = ({
	field,
	value,
	onChange,
	id,
}: ResourceFieldInputProps) => {
	const label = (
		<Label htmlFor={id} className="flex items-center gap-1">
			{field.label}
			{field.required && <span className="text-destructive">*</span>}
		</Label>
	);

	if (field.type === "checkbox") {
		return (
			<div className="flex items-center gap-2">
				<input
					id={id}
					type="checkbox"
					checked={Boolean(value)}
					onChange={(e) => onChange(field.key, e.target.checked)}
					className="h-4 w-4 rounded border-input accent-primary"
				/>
				<Label htmlFor={id}>{field.label}</Label>
			</div>
		);
	}

	if (field.type === "select") {
		return (
			<div className="space-y-1.5">
				{label}
				<Select
					value={typeof value === "string" ? value : ""}
					onValueChange={(v) => onChange(field.key, v)}
				>
					<SelectTrigger id={id} className="w-full">
						<SelectValue placeholder="Selecciona una opción" />
					</SelectTrigger>
					<SelectContent>
						{field.options?.map((opt) => (
							<SelectItem key={opt.value} value={opt.value}>
								{opt.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		);
	}

	if (field.type === "textarea") {
		return (
			<div className="space-y-1.5">
				{label}
				<Textarea
					id={id}
					value={typeof value === "string" ? value : ""}
					onChange={(e) => onChange(field.key, e.target.value)}
					rows={4}
				/>
			</div>
		);
	}

	if (field.type === "tags") {
		const asArray = Array.isArray(value) ? value : [];
		return (
			<div className="space-y-1.5">
				{label}
				<Input
					id={id}
					value={asArray.join(", ")}
					onChange={(e) =>
						onChange(
							field.key,
							e.target.value
								.split(",")
								.map((s) => s.trim())
								.filter(Boolean),
						)
					}
				/>
				{field.help && (
					<p className="text-xs text-muted-foreground">{field.help}</p>
				)}
			</div>
		);
	}

	// "text" | "url"
	return (
		<div className="space-y-1.5">
			{label}
			<Input
				id={id}
				type={field.type === "url" ? "url" : "text"}
				value={typeof value === "string" ? value : ""}
				onChange={(e) => onChange(field.key, e.target.value)}
			/>
			{field.help && (
				<p className="text-xs text-muted-foreground">{field.help}</p>
			)}
		</div>
	);
};
