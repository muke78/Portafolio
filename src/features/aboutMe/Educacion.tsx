import { getI18N } from "@/i18n";
import type { PropsLang } from "@/types/currentLang.interface";

export const Educacion = ({ currentLocale }: PropsLang) => {
	const i18n = getI18N({ currentLocale });
	return (
		<div className="flex flex-col p-4">
			<span className="font-serif-display text-[clamp(28px,4vw,48px)] font-normal">
				{i18n.EDUCATION.EDUCATION_TITLE}
			</span>
			<div className="grid grid-cols-1 w-full rounded-xl border border-border bg-card overflow-hidden shadow-md hover:bg-gradient-to-tr from-secondary/30 via-secondary/5 to-transparent hover:shadow-xl hover:brightness-105 hover:-translate-y-2 hover:scale-[1.02] transition-all duration-500 ease-in-out mt-4 anim-zoom-in">
				<img
					className="rounded-t-lg w-full h-auto"
					src="/UPVM.webp"
					alt={i18n.UNIVERSITY.UNIVERSITY_TITLE}
					width={940}
					height={220}
					loading="lazy"
					decoding="async"
					draggable="false"
				/>
				<div className="p-5">
					<div className="flex justify-between">
						<span className="text-2xl">{i18n.UNIVERSITY.UNIVERSITY_TITLE}</span>
						<p className="inline-flex place-items-center text-right text-secondary-foreground text-nowrap font-medium rounded-full bg-secondary px-3 py-1">
							2019 - 2022
						</p>
					</div>
					<p className="text-lg font-medium text-secondary">
						{" "}
						{i18n.UNIVERSITY.UNIVERSITY_SUBTITLE}
					</p>
					<div className="pt-4">
						<p className="font-normal text-base/8">
							{i18n.UNIVERSITY.UNIVERSITY_TEXT}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};
