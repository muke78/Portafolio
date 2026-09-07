import { zodResolver } from "@hookform/resolvers/zod";
import { Briefcase, Globe, MessageSquare, Send, User } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { type FieldError, useForm } from "react-hook-form";
import { SubmittedOpinion } from "@/features/opinions/SubmittedOpinion";
import { getI18N } from "@/i18n";
import type { FormOpinions, PropsLang } from "@/types/currentLang.interface";
import { opinionsSchema } from "@/schemas/opinionsSchema";
import { countries } from "@/data/countries";
import ReactCountryFlag from "react-country-flag";

export const SendOpinions = ({ currentLocale }: PropsLang) => {
	const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);

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
		await fetch("/api/comments", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(save),
		});

		setIsLoading(false);
		setIsSubmitted(true);
		reset();
	};

	const handleCountryChange = (
		e: React.ChangeEvent<HTMLSelectElement>,
	): void => {
		const code: string = e.target.value;
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
		return <SubmittedOpinion currentLocale={currentLocale} />;
	}

	return (
		<div className="min-h-screen w-full flex items-center justify-center py-4 px-3 sm:px-4">
			<div className="w-full max-w-lg sm:max-w-xl lg:max-w-2xl mx-auto my-auto">
				<div className="bg-base-100 rounded-xl shadow-xl overflow-hidden">
					{/* Header con gradiente - Más compacto */}
					<div className="bg-gradient-to-br from-primary via-secondary/70 to-accent p-3 sm:p-4 lg:p-6 text-center">
						<div>
							<MessageSquare className="w-12 h-12 text-base-200 mx-auto mb-3" />
						</div>
						<h2 className="lg:text-3xl md:text-2xl text-xl font-bold text-base-200">
							{i18n.OPINIONS.OPINIONS_FORM_TITLE}
						</h2>
						<p className="lg:text-2xl md:text-xl text-md text-base-200/80 mt-2">
							{i18n.OPINIONS.OPINIONS_FORM_SUBTITLE}
						</p>
					</div>

					{/* Formulario */}
					<div className="p-8 space-y-6">
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
							{/* Campo Nombre - Ancho completo */}
							<div className="space-y-2">
								<label
									className="flex items-center text-sm font-medium mb-2"
									htmlFor={nameId}
								>
									<User className="w-4 h-4 mr-2 text-secondary" />
									{i18n.FORM.INPUT_NAME}{" "}
									<span className="text-base font-bold text-error ml-1">*</span>
								</label>
								<input
									id={nameId}
									type="text"
									placeholder={i18n.OPINIONS.OPINIONS_FORM_NAME_PLACEHOLDER}
									className="input lg:input-lg input-md w-full"
									{...register("name")}
								/>
								{errors.name && (
									<div className="badge badge-error h-auto font-semibold text-sm mt-1 flex items-center">
										{(errors.name as FieldError)?.message}
									</div>
								)}
							</div>

							{/* Fila con Puesto y País */}
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
								{/* Campo Puesto (Opcional) - Media anchura */}
								<div className="space-y-2">
									<label
										className="flex items-center text-sm font-medium mb-2"
										htmlFor={jobId}
									>
										<Briefcase className="w-4 h-4 mr-2 text-secondary" />
										{i18n.FORM.INPUT_JOB}
										<span className="text-gray-400 text-xs ml-2">
											({i18n.FORM.INPUT_JOB_INPUT_OPTIONAL})
										</span>
										<span className="text-base font-bold text-error ml-1">
											&nbsp;
										</span>
									</label>
									<input
										id={jobId}
										type="text"
										placeholder={i18n.OPINIONS.OPINIONS_FORM_JOB_PLACEHOLDER}
										className="input lg:input-lg input-md w-full"
										{...register("job")}
									/>
									{errors.job && (
										<p className="badge badge-error h-auto font-semibold text-sm mt-1 flex items-center">
											{(errors.job as FieldError)?.message}
										</p>
									)}
								</div>

								{/* Campo País - Media anchura */}
								<div className="space-y-2">
									<label
										className="flex items-center text-sm font-medium mb-2"
										htmlFor={countryId}
									>
										<Globe className="w-4 h-4 mr-2 text-secondary" />
										{i18n.OPINIONS.OPINIONS_TITLE_SELECT_COUNTRY}
										<span className="text-base font-bold text-error ml-1">
											*
										</span>
									</label>

									{/* Select personalizado con banderas */}
									<div className="relative">
										<select
											id={countryId}
											className="select lg:select-lg select-md w-full pr-12"
											value={selected}
											onChange={(e) => handleCountryChange(e)}
										>
											<option value="" disabled>
												{i18n.OPINIONS.OPINIONS_PLACEHOLDER_SELECT_COUNTRY}
											</option>
											{countries.map((country) => (
												<option key={country.code} value={country.code}>
													{country.name}
												</option>
											))}
										</select>
										{/* Error del país */}
										{errors.country && (
											<div className="badge badge-error h-auto font-semibold text-sm mt-1 flex items-center">
												{(errors.country as FieldError)?.message}
											</div>
										)}

										{/* Bandera del país seleccionado */}
										{selected && (
											<div className="absolute right-10 top-1/2 transform -translate-y-1/2 pointer-events-none">
												<ReactCountryFlag
													countryCode={selected}
													svg
													style={{
														width: "1.5em",
														height: "1.5em",
													}}
													title={selected}
												/>
											</div>
										)}
									</div>

									{/* País seleccionado con bandera */}
									{selected && (
										<p className="mt-2 text-sm text-gray-600 flex items-center gap-2">
											País seleccionado:
											<span className="font-semibold flex items-center gap-1">
												<ReactCountryFlag
													countryCode={selected}
													svg
													style={{
														width: "1em",
														height: "1em",
													}}
													title={selected}
												/>
												{countryMap.get(selected)?.name}
											</span>
										</p>
									)}
								</div>
							</div>

							{/* Campo Descripción - Ancho completo */}
							<div className="space-y-2">
								<label
									className="flex items-center text-sm font-medium mb-2"
									htmlFor={descriptionId}
								>
									<MessageSquare className="w-4 h-4 mr-2 text-secondary" />
									{i18n.FORM.INPUT_TELL_EXPERIENCE}{" "}
									<span className="text-base font-bold text-error ml-1">*</span>
								</label>
								<textarea
									id={descriptionId}
									rows={4}
									placeholder={i18n.OPINIONS.OPINIONS_FORM_EXP_PLACEHOLDER}
									className="textarea lg:textarea-lg textarea-md w-full"
									{...register("description")}
								/>
								{errors.description && (
									<div className="badge badge-error h-auto font-semibold text-sm mt-1 flex items-center">
										{(errors.description as FieldError)?.message}
									</div>
								)}
							</div>

							<button
								type="submit"
								disabled={isLoading}
								className="btn xl:btn-xl lg:btn-lg btn-md bg-gradient-to-r from-primary via-secondary/70 to-accent text-base-200 btn-wide max-w-full hover:scale-[1.02] active:scale-95 transition-transform duration-200"
							>
								{isLoading ? (
									<div className="flex items-center space-x-2">
										<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
										<span>{i18n.OPINIONS.OPINIONS_LOAD_SEND_INFORMATION}</span>
									</div>
								) : (
									<div className="flex items-center space-x-2">
										<Send className="w-5 h-5" />
										<span>{i18n.OPINIONS.OPINIONS_SEND_INFORMATION}</span>
									</div>
								)}
							</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};
