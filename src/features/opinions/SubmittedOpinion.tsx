import { Check } from "lucide-react";
import { getI18N } from "@/i18n";
import type { PropsLang } from "@/types/currentLang.interface";

type SubmittedOpinionProps = PropsLang & {
	compact?: boolean;
	onClose?: () => void;
};

export const SubmittedOpinion = ({
	currentLocale,
	compact = false,
	onClose,
}: SubmittedOpinionProps) => {
	const i18n = getI18N({ currentLocale });

	const content = (
		<div
			className={
				compact
					? "bg-card rounded-xl p-6 text-center"
					: "bg-card rounded-3xl shadow-xl p-8 text-center"
			}
		>
			<div className="w-16 h-16 bg-success/15 rounded-full flex items-center justify-center mx-auto mb-4 anim-zoom-in">
				<Check className="w-8 h-8 text-success" />
			</div>

			<h2
				className={
					compact ? "text-lg font-bold mb-2" : "text-2xl font-bold mb-4"
				}
			>
				{i18n.OPINIONS.OPINIONS_SEND_SUCCESSFULL}
			</h2>

			<p
				className={
					compact
						? "text-sm text-muted-foreground mb-5"
						: "text-muted-foreground mb-6"
				}
			>
				{i18n.OPINIONS.OPINIONS_SEND_SUCCESSFULL_INFORMATION}
			</p>

			{compact ? (
				<button
					type="button"
					onClick={onClose}
					className="bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-medium hover-press"
				>
					Cerrar
				</button>
			) : (
				<a
					href="home#opinions"
					className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium inline-block hover-press active:translate-y-px"
				>
					{i18n.OPINIONS.OPINIONS_REDIRECT_COMMENTS}
				</a>
			)}
		</div>
	);

	if (compact) return content;

	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<div className="w-full max-w-md anim-zoom-in">{content}</div>
		</div>
	);
};
