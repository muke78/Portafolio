import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Send, Github, Linkedin, MessageCircle } from "lucide-react";
import { type FieldError, useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getI18N } from "@/i18n";
import type { FormData, PropsLang } from "@/types/currentLang.interface";
import { contactSchema } from "@/schemas/contactSchema";

export const Form = ({ currentLocale }: PropsLang) => {
	const i18n = getI18N({ currentLocale });
	const sendInformationValid = `${i18n.FORM.FORM_SEND_INFORMATION_CORRECT}`;
	const errorSendInformation = `${i18n.FORM.FORM_SEND_INFORMATION_INCORRECT}`;

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<FormData>({
		resolver: zodResolver(contactSchema({ currentLocale })),
		defaultValues: {
			name: "",
			email: "",
			phone: "",
			moreInformation: "",
		},
	});

	const onSubmit = async (data: FormData) => {
		try {
			await fetch("/api/tlgrm", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			toast.success(sendInformationValid, {
				duration: 5000,
				position: "bottom-right",
			});
			reset();
		} catch (error) {
			toast.error(`${errorSendInformation}, ${error}`, {
				duration: 5000,
				position: "bottom-right",
			});
			console.error("Error:", error);
		}
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
			<div className="space-y-1 text-foreground">
				<small className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
					{i18n.FORM.FORM_TITLE_SMALL_SUBHEADER}
				</small>

				<h2 className="font-serif-display text-4xl lg:text-6xl leading-[0.98]">
					{i18n.FORM.FORM_TITLE_HEAD_STRONG}{" "}
					<span className="italic text-muted-foreground">
						{i18n.FORM.FORM_TITLE_HEAD_STRONG_SECOND}
					</span>
					<span className="block italic text-muted-foreground">
						{i18n.FORM.FORM_TITLE_HEAD_STRONG_THRID}
					</span>
				</h2>

				<p className="text-base leading-relaxed text-muted-foreground my-8">
					{i18n.FORM.FORM_SUBTITLE_SUBHEAD}
				</p>

				<ul className="space-y-2">
					<li className="flex items-center gap-4">
						<span className="text-3xl text-secondary">
							{<Github size={36} />}
						</span>
						<span>
							<strong className="text-sm text-muted-foreground">
								{/* {i18n.FORM.FORM_OPTIONS_CONTACT_PHONE} */}
								Github
							</strong>{" "}
							<a
								href="https://github.com/muke78"
								target="_blank"
								aria-label="Saber mas acerca de mis repositorios y lo que he hecho"
								className="flex"
								rel="noopener noreferrer"
							>
								muke78
							</a>
						</span>
					</li>

					<li className="flex items-center gap-4">
						<span className="text-3xl text-secondary">
							{<Linkedin size={36} />}
						</span>
						<span>
							<strong className="text-sm text-muted-foreground">
								{/* {i18n.FORM.FORM_OPTIONS_CONTACT_PHONE} */}
								Linkedin
							</strong>{" "}
							<a
								href="https://www.linkedin.com/in/erick-miguel-gonz%C3%A1lez-rivera-96265b248/"
								target="_blank"
								aria-label="Saber mas acerca de experiencia"
								className="flex"
								rel="noopener noreferrer"
							>
								Erick Miguel Gonzalez Rivera
							</a>
						</span>
					</li>

					<li className="flex items-center gap-4">
						<span className="text-3xl text-secondary">
							{<MessageCircle size={36} />}
						</span>
						<span>
							<strong className="text-sm text-muted-foreground">
								{i18n.FORM.FORM_OPTIONS_CONTACT_PHONE}
							</strong>{" "}
							<a
								href="https://wa.me/+527203966119"
								target="_blank"
								aria-label="+52-551-190 9105"
								className="flex"
								rel="noopener noreferrer"
							>
								+52-551-190 9105
							</a>
						</span>
					</li>

					<li className="flex items-center gap-4">
						<span className="text-3xl text-secondary ">
							{<Mail size={36} />}
						</span>
						<span>
							<strong className="text-sm text-muted-foreground">
								{i18n.FORM.FORM_OPTIONS_CONTACT_EMAIL}
							</strong>{" "}
							<a
								href="mailto:erickm.gonzalez.rivera@gmail.com"
								target="_blank"
								aria-label="erickm.gonzalez.rivera@gmail.com"
								className="flex"
								rel="noopener noreferrer"
							>
								erickm.gonzalez.rivera@gmail.com
							</a>
						</span>
					</li>
				</ul>
			</div>

			<div className="rounded-xl bg-muted p-5 lg:p-10 md:p-9 sm:p-8">
				<form onSubmit={handleSubmit(onSubmit)} method="POST">
					<div className="grid grid-cols-1 gap-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">
								{i18n.FORM.INPUT_NAME}{" "}
								<span className="text-base font-bold text-destructive">*</span>
							</label>
							<Input
								type="text"
								className="bg-background"
								placeholder={i18n.FORM.INPUT_NAME}
								{...register("name")}
							/>
							{errors.name && (
								<div className="inline-flex items-center gap-1 rounded-md bg-destructive/10 text-destructive text-sm font-medium px-2 py-1 mt-1">
									{(errors.name as FieldError)?.message}
								</div>
							)}
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">
								{i18n.FORM.INPUT_EMAIL}{" "}
								<span className="text-base font-bold text-destructive">*</span>
							</label>
							<Input
								type="email"
								className="bg-background"
								placeholder={i18n.FORM.INPUT_EMAIL}
								{...register("email")}
							/>
							{errors.email && (
								<div className="inline-flex items-center gap-1 rounded-md bg-destructive/10 text-destructive text-sm font-medium px-2 py-1 mt-1">
									{(errors.email as FieldError)?.message}
								</div>
							)}
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">
								{i18n.FORM.INPUT_PHONE}{" "}
								<span className="text-base font-bold text-destructive">*</span>
							</label>
							<Input
								type="number"
								className="bg-background"
								placeholder={i18n.FORM.INPUT_PHONE}
								{...register("phone")}
							/>
							{errors.phone && (
								<div className="inline-flex items-center gap-1 rounded-md bg-destructive/10 text-destructive text-sm font-medium px-2 py-1 mt-1">
									{(errors.phone as FieldError)?.message}
								</div>
							)}
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">
								{i18n.FORM.INPUT_MORE_INFORMATION}
								<span className="text-muted-foreground text-xs">
									({i18n.FORM.INPUT_JOB_INPUT_OPTIONAL})
								</span>
							</label>
							<Textarea
								className="bg-background"
								placeholder={i18n.FORM.INPUT_MORE_INFORMATION_TEXT}
								{...register("moreInformation")}
							/>
							{errors.moreInformation && (
								<div className="inline-flex items-center gap-1 rounded-md bg-destructive/10 text-destructive text-sm font-medium px-2 py-1 mt-1">
									{(errors.moreInformation as FieldError)?.message}
								</div>
							)}
						</div>
						<button
							type="submit"
							className="inline-flex items-center justify-center gap-2 rounded-full h-11 w-full max-w-full mt-2 bg-primary text-primary-foreground font-medium hover:opacity-85 active:scale-[0.98] transition-all duration-200"
						>
							<Send className="w-5 h-5" />
							{i18n.FORM.BUTTON_LABEL}
						</button>
					</div>

					<Toaster
						toastOptions={{
							style: {
								background: "var(--card)",
								color: "var(--card-foreground)",
								border: "1px solid var(--border)",
							},
						}}
						reverseOrder={false}
					/>
				</form>
			</div>
		</div>
	);
};
