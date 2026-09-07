import { Check } from "lucide-react";
import { getI18N } from "@/i18n";
import type { PropsLang } from "@/types/currentLang.interface";

export const SubmittedOpinion = ({ currentLocale }: PropsLang) => {
	const i18n = getI18N({ currentLocale });
	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<div className="w-full max-w-md anim-zoom-in">
				<div className="bg-card rounded-3xl shadow-xl p-8 text-center">
					<div className="w-20 h-20 bg-success/15 rounded-full flex items-center justify-center mx-auto mb-6 anim-zoom-in">
						<Check className="w-10 h-10 text-success" />
					</div>

					<h2 className="text-2xl font-bold mb-4">
						{i18n.OPINIONS.OPINIONS_SEND_SUCCESSFULL}
					</h2>

					<p className="text-muted-foreground mb-6">
						{i18n.OPINIONS.OPINIONS_SEND_SUCCESSFULL_INFORMATION}
					</p>

					<a
						href="home#opinions"
						className="bg-primary hover:bg-primary/80 text-primary-foreground px-6 py-3 rounded-full font-medium transition-colors duration-200 inline-block hover:scale-105 active:scale-95"
					>
						{i18n.OPINIONS.OPINIONS_REDIRECT_COMMENTS}
					</a>
				</div>
			</div>
		</div>
	);
};
