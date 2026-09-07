import { zodResolver } from "@hookform/resolvers/zod";
import { Briefcase, Globe, MessageSquare, Send, User } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { type FieldError, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SubmittedOpinion } from "@/features/opinions/SubmittedOpinion";
import { getI18N } from "@/i18n";
import type { FormOpinions, PropsLang } from "@/types/currentLang.interface";
import { opinionsSchema } from "@/schemas/opinionsSchema";
import { countries } from "@/data/countries";
import ReactCountryFlag from "react-country-flag";

type SendOpinionsProps = PropsLang & { onClose?: () => void };

export const SendOpinions = ({ currentLocale, onClose }: SendOpinionsProps) => {
	const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	const [selected, setSelected] = useState<string>("");

	// Ids dinamicos para la accesibilidad (a11y)
	const nameId = useId();
	const jobId = useId();
	const descriptionId = useId();
	const countryId = useId();

	const countryMap = useMemo(() => {
		return new Map(countries.map((c) => [c.code, c]));
	}, []);

	const i18n = getI18N({ currentLocale });

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
		setValue,
	} = useForm<FormOpinions>({
		resolver: zodResolver(opinionsSchema({ currentLocale })),
		defaultValues: {
			name: "",
			job: "",
			description: "",
			country: "",
			country_flag: "",
		},
	});

	const onSubmit = async (save: FormOpinions) => {
		setIsLoading(true);
		setSubmitError(null);
		try {
			const res = await fetch("/api/comments", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(save),
			});
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			setIsSubmitted(true);
			reset();
		} catch {
			setSubmitError(i18n.FORM.FORM_SEND_INFORMATION_INCORRECT);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCountryChange = (code: string): void => {
		setSelected(code);

		const country = countryMap.get(code);

		if (country) {
			setValue("country", country.name, {
				shouldValidate: true,
			});
			setValue("country_flag", country.code);
		}
	};

	if (isSubmitted) {
		return (
			<SubmittedOpinion
				currentLocale={currentLocale}
				compact
				onClose={onClose}
			/>
		);
	}

	return (
		<div className="bg-card rounded-xl overflow-hidden">
			<div className="bg-primary px-5 py-4 flex items-center gap-3">
				<MessageSquare className="w-6 h-6 text-white shrink-0" />
				<div>
					<h2 className="text-base font-semibold text-white leading-tight">
						{i18n.OPINIONS.OPINIONS_FORM_TITLE}
					</h2>
					<p className="text-xs text-white/80 leading-snug">
						{i18n.OPINIONS.OPINIONS_FORM_SUBTITLE}
					</p>
				</div>
			</div>

			<div className="p-5">
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div className="space-y-1.5">
						<label
							className="flex items-center text-xs font-medium"
							htmlFor={nameId}
						>
							<User className="w-3.5 h-3.5 mr-1.5 text-secondary" />
							{i18n.FORM.INPUT_NAME}{" "}
							<span className="text-destructive ml-1">*</span>
						</label>
						<Input
							id={nameId}
							type="text"
							placeholder={i18n.OPINIONS.OPINIONS_FORM_NAME_PLACEHOLDER}
							className="h-9"
							{...register("name")}
						/>
						{errors.name && (
							<div className="inline-flex items-center gap-1 rounded-md bg-destructive/10 text-destructive text-xs font-medium px-2 py-1">
								{(errors.name as FieldError)?.message}
							</div>
						)}
					</div>

					<div className="space-y-1.5">
						<label
							className="flex items-center text-xs font-medium"
							htmlFor={jobId}
						>
							<Briefcase className="w-3.5 h-3.5 mr-1.5 text-secondary" />
							{i18n.FORM.INPUT_JOB}
							<span className="text-muted-foreground ml-1">
								({i18n.FORM.INPUT_JOB_INPUT_OPTIONAL})
							</span>
						</label>
						<Input
							id={jobId}
							type="text"
							placeholder={i18n.OPINIONS.OPINIONS_FORM_JOB_PLACEHOLDER}
							className="h-9"
							{...register("job")}
						/>
						{errors.job && (
							<p className="inline-flex items-center gap-1 rounded-md bg-destructive/10 text-destructive text-xs font-medium px-2 py-1">
								{(errors.job as FieldError)?.message}
							</p>
						)}
					</div>

					<div className="space-y-1.5">
						<label
							className="flex items-center text-xs font-medium"
							htmlFor={countryId}
						>
							<Globe className="w-3.5 h-3.5 mr-1.5 text-secondary" />
							{i18n.OPINIONS.OPINIONS_TITLE_SELECT_COUNTRY}
							<span className="text-destructive ml-1">*</span>
						</label>

						<div>
							<Select value={selected} onValueChange={handleCountryChange}>
								<SelectTrigger id={countryId} className="h-9 w-full">
									<SelectValue
										placeholder={
											i18n.OPINIONS.OPINIONS_PLACEHOLDER_SELECT_COUNTRY
										}
									>
										{(value: string) => {
											const country = countryMap.get(value);
											if (!country) {
												return i18n.OPINIONS
													.OPINIONS_PLACEHOLDER_SELECT_COUNTRY;
											}
											return (
												<>
													<ReactCountryFlag
														countryCode={country.code}
														svg
														style={{ width: "1.1em", height: "1.1em" }}
														title={country.code}
													/>
													{country.name}
												</>
											);
										}}
									</SelectValue>
								</SelectTrigger>
								<SelectContent>
									{countries.map((country) => (
										<SelectItem key={country.code} value={country.code}>
											<ReactCountryFlag
												countryCode={country.code}
												svg
												style={{ width: "1.1em", height: "1.1em" }}
												title={country.code}
											/>
											{country.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{errors.country && (
								<div className="inline-flex items-center gap-1 rounded-md bg-destructive/10 text-destructive text-xs font-medium px-2 py-1 mt-1">
									{(errors.country as FieldError)?.message}
								</div>
							)}
						</div>
					</div>

					<div className="space-y-1.5">
						<label
							className="flex items-center text-xs font-medium"
							htmlFor={descriptionId}
						>
							<MessageSquare className="w-3.5 h-3.5 mr-1.5 text-secondary" />
							{i18n.FORM.INPUT_TELL_EXPERIENCE}{" "}
							<span className="text-destructive ml-1">*</span>
						</label>
						<Textarea
							id={descriptionId}
							rows={3}
							placeholder={i18n.OPINIONS.OPINIONS_FORM_EXP_PLACEHOLDER}
							{...register("description")}
						/>
						{errors.description && (
							<div className="inline-flex items-center gap-1 rounded-md bg-destructive/10 text-destructive text-xs font-medium px-2 py-1">
								{(errors.description as FieldError)?.message}
							</div>
						)}
					</div>

					{submitError && (
						<div
							role="alert"
							className="rounded-md bg-destructive/10 text-destructive text-xs font-medium px-3 py-2"
						>
							{submitError}
						</div>
					)}

					<button
						type="submit"
						disabled={isLoading}
						className="inline-flex items-center justify-center gap-2 rounded-lg h-10 w-full bg-primary text-primary-foreground font-medium text-sm transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
					>
						{isLoading ? (
							<>
								<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
								<span>{i18n.OPINIONS.OPINIONS_LOAD_SEND_INFORMATION}</span>
							</>
						) : (
							<>
								<Send className="w-4 h-4" />
								<span>{i18n.OPINIONS.OPINIONS_SEND_INFORMATION}</span>
							</>
						)}
					</button>
				</form>
			</div>
		</div>
	);
};
