import { getI18N } from "@/i18n";
import type { PropsLang } from "@/interfaces/currentLang.interface";
import { motion } from "framer-motion";

export const Educacion = ({ currentLocale }: PropsLang) => {
	const i18n = getI18N({ currentLocale });
	return (
		<div className="flex flex-col p-4">
			<span className="font-bold text-5xl">
				{i18n.EDUCATION.EDUCATION_TITLE}
			</span>
			<motion.div
				className="grid grid-cols-1 w-full card bg-base-100 shadow-md border border-transparent 
      hover:bg-gradient-to-tr from-secondary/30 via-secondary/5 to-transparent hover:shadow-xl
      hover:brightness-105 transition-discrete duration-500 ease-in-out  mt-4 animate__animated animate__zoomIn"
				whileHover={{
					y: -8,
					scale: 1.03,
					transition: { duration: 0.5, ease: "easeInOut" },
				}}
			>
				<img
					className="rounded-t-lg w-full"
					src="/UPVM.webp"
					alt="Universidad Politecnica del Valle de Mexico"
					loading="lazy"
				/>
				<div className="p-5">
					<div className="flex justify-between">
						<span className="text-2xl">{i18n.UNIVERSITY.UNIVERSITY_TITLE}</span>
						<p className="flex place-items-center text-right text-base-200 text-nowrap font-medium badge badge-secondary">
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
			</motion.div>
		</div>
	);
};
