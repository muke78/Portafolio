import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Briefcase, Globe, MessageSquare, Send, User } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { type FieldError, useForm } from "react-hook-form";
import { SubmittedOpinion } from "@/components/features/opinions/SubmittedOpinion";
import { getI18N } from "@/i18n";
import type {
	FormOpinions,
	PropsLang,
} from "@/interfaces/currentLang.interface";
import { opinionsSchema } from "@/schemas/opinionsSchema";
import { countries } from "@/utils/countries";
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

	const containerVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.6,
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0 },
	};

	if (isSubmitted) {
		return <SubmittedOpinion currentLocale={currentLocale} />;
	}

	return (
		<div className="min-h-screen w-full flex items-center justify-center py-4 px-3 sm:px-4">
			<motion.div
				className="w-full max-w-lg sm:max-w-xl lg:max-w-2xl mx-auto my-auto"
				variants={containerVariants}
				initial="hidden"
				animate="visible"
			>
				<motion.div
					className="bg-base-100 rounded-xl shadow-xl overflow-hidden"
					variants={itemVariants}
				>
					{/* Header con gradiente - Más compacto */}
					<div className="bg-gradient-to-br from-primary via-secondary/70 to-accent p-3 sm:p-4 lg:p-6 text-center">
						<motion.div
							initial={{ rotate: -180, opacity: 0 }}
							animate={{ rotate: 0, opacity: 1 }}
							transition={{ duration: 0.6, delay: 0.2 }}
						>
							<MessageSquare className="w-12 h-12 text-base-200 mx-auto mb-3" />
						</motion.div>
						<motion.h2
							className="lg:text-3xl md:text-2xl text-xl font-bold text-base-200"
							variants={itemVariants}
						>
							{i18n.OPINIONS.OPINIONS_FORM_TITLE}
						</motion.h2>
						<motion.p
							className="lg:text-2xl md:text-xl text-md text-base-200/80 mt-2"
							variants={itemVariants}
						>
							{i18n.OPINIONS.OPINIONS_FORM_SUBTITLE}
						</motion.p>
					</div>

					{/* Formulario */}
					<div className="p-8 space-y-6">
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
							{/* Campo Nombre - Ancho completo */}
							<motion.div variants={itemVariants} className="space-y-2">
								<label
									className="flex items-center text-sm font-medium mb-2"
									htmlFor={nameId}
								>
									<User className="w-4 h-4 mr-2 text-secondary" />
									{i18n.FORM.INPUT_NAME}{" "}
									<span className="text-base font-bold text-error ml-1">*</span>
								</label>
								<motion.input
									id={nameId}
									type="text"
									placeholder={i18n.OPINIONS.OPINIONS_FORM_NAME_PLACEHOLDER}
									className="input lg:input-lg input-md w-full"
									whileFocus={{ scale: 1.02 }}
									{...register("name")}
								/>
								{errors.name && (
									<motion.div
										className="badge badge-error h-auto font-semibold text-sm mt-1 flex items-center"
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
									>
										{(errors.name as FieldError)?.message}
									</motion.div>
								)}
							</motion.div>

							{/* Fila con Puesto y País */}
							<motion.div
								variants={itemVariants}
								className="grid grid-cols-1 lg:grid-cols-2 gap-4"
							>
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
									<motion.input
										id={jobId}
										type="text"
										placeholder={i18n.OPINIONS.OPINIONS_FORM_JOB_PLACEHOLDER}
										className="input lg:input-lg input-md w-full"
										whileFocus={{ scale: 1.02 }}
										{...register("job")}
									/>
									{errors.job && (
										<motion.p
											className="badge badge-error h-auto font-semibold text-sm mt-1 flex items-center"
											initial={{ opacity: 0, y: -10 }}
											animate={{ opacity: 1, y: 0 }}
										>
											{(errors.job as FieldError)?.message}
										</motion.p>
									)}
								</div>

								{/* Campo País - Media anchura */}
								<div className="space-y-2">
									<label
										className="flex items-center text-sm font-medium mb-2"
										htmlFor={countryId}
									>
										<Globe className="w-4 h-4 mr-2 text-secondary" />
										País
										<span className="text-base font-bold text-error ml-1">
											*
										</span>
									</label>

									{/* Select personalizado con banderas */}
									<div className="relative">
										<motion.select
											id={countryId}
											className="select lg:select-lg select-md w-full pr-12"
											value={selected}
											onChange={(e) => {
												const code = e.target.value;
												setSelected(code);

												const country = countries.find((c) => c.code === code);

												if (country) {
													setValue("country", country.name, {
														shouldValidate: true,
													});
													setValue("country_flag", country.code);
												}
											}}
											whileFocus={{ scale: 1.02 }}
										>
											<option value="" disabled>
												Selecciona un país
											</option>
											{countries.map((country) => (
												<option key={country.code} value={country.code}>
													{country.name}
												</option>
											))}
										</motion.select>
										{/* Error del país */}
										{errors.country && (
											<motion.div
												className="badge badge-error h-auto font-semibold text-sm mt-1 flex items-center"
												initial={{ opacity: 0, y: -10 }}
												animate={{ opacity: 1, y: 0 }}
											>
												{(errors.country as FieldError)?.message}
											</motion.div>
										)}

										{/* Bandera del país seleccionado */}
										{selected && (
											<motion.div
												className="absolute right-10 top-1/2 transform -translate-y-1/2 pointer-events-none"
												initial={{ opacity: 0, scale: 0.8 }}
												animate={{ opacity: 1, scale: 1 }}
												transition={{ duration: 0.2 }}
											>
												<ReactCountryFlag
													countryCode={selected}
													svg
													style={{
														width: "1.5em",
														height: "1.5em",
													}}
													title={selected}
												/>
											</motion.div>
										)}
									</div>

									{/* País seleccionado con bandera */}
									{selected && (
										<motion.p
											className="mt-2 text-sm text-gray-600 flex items-center gap-2"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
										>
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
												{countries.find((c) => c.code === selected)?.name}
											</span>
										</motion.p>
									)}
								</div>
							</motion.div>

							{/* Campo Descripción - Ancho completo */}
							<motion.div variants={itemVariants} className="space-y-2">
								<label
									className="flex items-center text-sm font-medium mb-2"
									htmlFor={descriptionId}
								>
									<MessageSquare className="w-4 h-4 mr-2 text-secondary" />
									{i18n.FORM.INPUT_TELL_EXPERIENCE}{" "}
									<span className="text-base font-bold text-error ml-1">*</span>
								</label>
								<motion.textarea
									id={descriptionId}
									rows={4}
									placeholder={i18n.OPINIONS.OPINIONS_FORM_EXP_PLACEHOLDER}
									className="textarea lg:textarea-lg textarea-md w-full"
									whileFocus={{ scale: 1.02 }}
									{...register("description")}
								/>
								{errors.description && (
									<motion.div
										className="badge badge-error h-auto font-semibold text-sm mt-1 flex items-center"
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
									>
										{(errors.description as FieldError)?.message}
									</motion.div>
								)}
							</motion.div>

							{/* Botón de envío */}
							<motion.button
								type="submit"
								disabled={isLoading}
								variants={itemVariants}
								className="btn xl:btn-xl lg:btn-lg btn-md bg-gradient-to-r from-primary via-secondary/70 to-accent text-base-200 btn-wide max-w-full"
								whileHover={{ scale: 1.05, y: -2 }}
								whileTap={{ scale: 0.95 }}
							>
								<AnimatePresence mode="wait">
									{isLoading ? (
										<motion.div
											key="loading"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
											className="flex items-center space-x-2"
										>
											<motion.div
												className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
												animate={{ rotate: 360 }}
												transition={{
													duration: 1,
													repeat: Infinity,
													ease: "linear",
												}}
											/>
											<span>
												{i18n.OPINIONS.OPINIONS_LOAD_SEND_INFORMATION}
											</span>
										</motion.div>
									) : (
										<motion.div
											key="submit"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
											className="flex items-center space-x-2"
										>
											<Send className="w-5 h-5" />
											<span>{i18n.OPINIONS.OPINIONS_SEND_INFORMATION}</span>
										</motion.div>
									)}
								</AnimatePresence>
							</motion.button>
						</form>
					</div>
				</motion.div>
			</motion.div>
		</div>
	);
};
