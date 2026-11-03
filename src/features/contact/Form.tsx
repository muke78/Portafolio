import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, MessageCircle, Send } from "lucide-react";
import { useId } from "react";
import { type FieldError, useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { GithubIcon, LinkedinIcon } from "@/components/icons/BrandIcons";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getI18N } from "@/i18n";
import { githubHandle, mailtoUrl, whatsappUrl } from "@/lib/contactLinks";
import { contactSchema } from "@/schemas/contactSchema";
import type { SiteContact } from "@/schemas/siteContactSchema";
import type { FormData, PropsLang } from "@/types/currentLang.interface";

export const Form = ({
	currentLocale,
	contact,
}: PropsLang & { contact: SiteContact }) => {
	const i18n = getI18N({ currentLocale });
	const sendInformationValid = `${i18n.FORM.FORM_SEND_INFORMATION_CORRECT}`;
	const errorSendInformation = `${i18n.FORM.FORM_SEND_INFORMATION_INCORRECT}`;

	// Unique per mount (same pattern as sendOpinions.tsx) so label/control
	// pairs stay valid even if this form is ever rendered more than once.
	const nameId = useId();
	const emailId = useId();
	const phoneId = useId();
	const moreInformationId = useId();

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
			const res = await fetch("/api/contact-messages", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!res.ok) throw new Error(`HTTP ${res.status}`);

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
		<div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
			<div className="space-y-1 text-foreground lg:col-span-5" data-reveal>
				<small className="eyebrow">
					{i18n.FORM.FORM_TITLE_SMALL_SUBHEADER}
				</small>

				<h2 className="font-serif-display text-title" data-split>
					{i18n.FORM.FORM_TITLE_HEAD_STRONG}{" "}
					<span className="italic text-muted-foreground">
						{i18n.FORM.FORM_TITLE_HEAD_STRONG_SECOND}
					</span>
					<span className="block italic text-muted-foreground">
						{i18n.FORM.FORM_TITLE_HEAD_STRONG_THRID}
					</span>
				</h2>

				<p
					className="text-base leading-relaxed text-muted-foreground my-8"
					data-scrub-text
				>
					{i18n.FORM.FORM_SUBTITLE_SUBHEAD}
				</p>

				<ul className="space-y-2" data-stagger data-stagger-delay="0.2">
					<li className="flex items-center gap-4" data-stagger-item>
						<span className="text-3xl text-secondary">
							<GithubIcon size={36} aria-hidden="true" />
						</span>
						<span>
							<strong className="text-sm text-muted-foreground">
								{/* {i18n.FORM.FORM_OPTIONS_CONTACT_PHONE} */}
								Github
							</strong>{" "}
							<a
								href={contact.github_url}
								target="_blank"
								className="flex"
								rel="noopener noreferrer"
							>
								{githubHandle(contact.github_url)}
							</a>
						</span>
					</li>

					<li className="flex items-center gap-4" data-stagger-item>
						<span className="text-3xl text-secondary">
							<LinkedinIcon size={36} aria-hidden="true" />
						</span>
						<span>
							<strong className="text-sm text-muted-foreground">
								{/* {i18n.FORM.FORM_OPTIONS_CONTACT_PHONE} */}
								Linkedin
							</strong>{" "}
							<a
								href={contact.linkedin_url}
								target="_blank"
								className="flex"
								rel="noopener noreferrer"
							>
								{contact.linkedin_name}
							</a>
						</span>
					</li>

					<li className="flex items-center gap-4" data-stagger-item>
						<span className="text-3xl text-secondary">
							{<MessageCircle size={36} />}
						</span>
						<span>
							<strong className="text-sm text-muted-foreground">
								{i18n.FORM.FORM_OPTIONS_CONTACT_PHONE}
							</strong>{" "}
							<a
								href={whatsappUrl(contact.phone)}
								target="_blank"
								aria-label={contact.phone}
								className="flex"
								rel="noopener noreferrer"
							>
								{contact.phone}
							</a>
						</span>
					</li>

					<li className="flex items-center gap-4" data-stagger-item>
						<span className="text-3xl text-secondary ">
							{<Mail size={36} />}
						</span>
						<span>
							<strong className="text-sm text-muted-foreground">
								{i18n.FORM.FORM_OPTIONS_CONTACT_EMAIL}
							</strong>{" "}
							<a
								href={mailtoUrl(contact.email)}
								target="_blank"
								aria-label={contact.email}
								className="flex"
								rel="noopener noreferrer"
							>
								{contact.email}
							</a>
						</span>
					</li>
				</ul>
			</div>

			<div
				className="rounded-xl border border-border bg-card p-5 sm:p-8 lg:col-span-7 lg:p-10"
				data-mask
			>
				<form onSubmit={handleSubmit(onSubmit)} method="POST">
					<div
						className="grid grid-cols-1 gap-4"
						data-stagger
						data-stagger-delay="0.45"
					>
						<div className="space-y-2" data-stagger-item>
							<label className="text-sm font-medium" htmlFor={nameId}>
								{i18n.FORM.INPUT_NAME}{" "}
								<span className="text-base font-bold text-destructive">*</span>
							</label>
							<Input
								id={nameId}
								type="text"
								className="h-11 bg-background text-base"
								placeholder={i18n.FORM.INPUT_NAME}
								{...register("name")}
							/>
							{errors.name && (
								<div className="inline-flex items-center gap-1 rounded-md bg-destructive/10 text-destructive text-sm font-medium px-2 py-1 mt-1">
									{(errors.name as FieldError)?.message}
								</div>
							)}
						</div>
						<div className="space-y-2" data-stagger-item>
							<label className="text-sm font-medium" htmlFor={emailId}>
								{i18n.FORM.INPUT_EMAIL}{" "}
								<span className="text-base font-bold text-destructive">*</span>
							</label>
							<Input
								id={emailId}
								type="email"
								className="h-11 bg-background text-base"
								placeholder={i18n.FORM.INPUT_EMAIL}
								{...register("email")}
							/>
							{errors.email && (
								<div className="inline-flex items-center gap-1 rounded-md bg-destructive/10 text-destructive text-sm font-medium px-2 py-1 mt-1">
									{(errors.email as FieldError)?.message}
								</div>
							)}
						</div>
						<div className="space-y-2" data-stagger-item>
							<label className="text-sm font-medium" htmlFor={phoneId}>
								{i18n.FORM.INPUT_PHONE}{" "}
								<span className="text-base font-bold text-destructive">*</span>
							</label>
							<Input
								id={phoneId}
								type="tel"
								inputMode="tel"
								autoComplete="tel"
								className="h-11 bg-background text-base"
								placeholder={i18n.FORM.INPUT_PHONE}
								{...register("phone")}
							/>
							{errors.phone && (
								<div className="inline-flex items-center gap-1 rounded-md bg-destructive/10 text-destructive text-sm font-medium px-2 py-1 mt-1">
									{(errors.phone as FieldError)?.message}
								</div>
							)}
						</div>
						<div className="space-y-2" data-stagger-item>
							<label
								className="text-sm font-medium"
								htmlFor={moreInformationId}
							>
								{i18n.FORM.INPUT_MORE_INFORMATION}
								<span className="text-muted-foreground text-xs">
									({i18n.FORM.INPUT_JOB_INPUT_OPTIONAL})
								</span>
							</label>
							<Textarea
								id={moreInformationId}
								className="h-11 bg-background text-base"
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
							data-stagger-item
							className="inline-flex items-center justify-center gap-2 rounded-full h-11 w-full max-w-full mt-2 bg-primary text-primary-foreground font-medium hover-press active:translate-y-px"
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
