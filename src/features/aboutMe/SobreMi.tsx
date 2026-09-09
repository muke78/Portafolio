import { getI18N } from "@/i18n";
import type { PropsLang } from "@/types/currentLang.interface";

export const SobreMi = ({ currentLocale }: PropsLang) => {
	const i18n = getI18N({ currentLocale });

	return (
		<div className="w-full flex flex-col p-4">
			<span className="font-serif-display text-[clamp(28px,4vw,48px)] font-normal">
				{" "}
				{i18n.ABOUTME.ABOUT_TITLE}
			</span>
			<div className="grid grid-cols-1 w-full rounded-xl border border-border bg-card overflow-hidden shadow-md hover:bg-gradient-to-tr from-secondary/30 via-secondary/5 to-transparent hover:shadow-2xl hover:brightness-105 hover:-translate-y-2 hover:scale-[1.02] transition-all duration-500 ease-in-out mt-4 anim-zoom-in">
				<img
					className="rounded-t-lg"
					src="/Aboutme.webp"
					alt={i18n.ABOUTME.ABOUT_TITLE}
					width={1600}
					height={400}
					style={{
						width: "100%",
						height: "400px",
						objectFit: "cover",
					}}
					loading="lazy"
					decoding="async"
					draggable="false"
				/>
				<div className="p-5">
					<div className="flex justify-between">
						<span className="text-2xl">{i18n.ABOUTME.ABOUT_TITLE_CARD}</span>
					</div>
					<p className="inline-flex items-center rounded-full bg-secondary text-secondary-foreground text-base font-medium my-2 px-3 py-1 w-fit">
						{i18n.ABOUTME.ABOUT_SUBTITLE}
					</p>
					<div>
						<p className="font-normal text-base/8">
							{i18n.ABOUTME.ABOUT_ABOUT_DESCRIPTION}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};
