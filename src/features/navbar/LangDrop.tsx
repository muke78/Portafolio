import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getI18N } from "@/i18n";
import { languages } from "@/i18n/ui";
import type { PropsLang } from "@/types/currentLang.interface";

export const LangDrop = ({ currentLocale }: PropsLang) => {
	const [selectedLang, setSelectedLang] = useState<string>(currentLocale);
	const [isOpen, setIsOpen] = useState(false);
	const [_i18n, setI18n] = useState(() =>
		getI18N({ currentLocale: currentLocale }),
	);

	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const langFromPath = window.location.pathname.split("/")[1];
		const lang = Object.keys(languages).includes(langFromPath)
			? langFromPath
			: currentLocale;

		setSelectedLang(lang);
		setI18n(getI18N({ currentLocale: lang }));
	}, [currentLocale]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const toggleDropdown = () => setIsOpen(!isOpen);

	const selectLanguage = (lang: string) => {
		setSelectedLang(lang);
		setIsOpen(false);
		setI18n(getI18N({ currentLocale: lang }));
		const currentHash = window.location.hash;
		const newPath = `/${lang}/${window.location.pathname.split("/").slice(2).join("/")}${currentHash}`;
		window.location.href = newPath;
	};

	return (
		<div className="relative inline-block text-left" ref={dropdownRef}>
			<button
				type="button"
				onClick={toggleDropdown}
				className="btn hover:bg-base-content/10 px-3 py-2 rounded-xl transition-colors duration-200 flex items-center gap-2 border border-base-content/10"
			>
				<img
					src={languages[selectedLang].img.src}
					alt={`Bandera de ${languages[selectedLang].label}`}
					className="w-5 h-5 rounded-full object-cover shadow-sm"
					loading="lazy"
					decoding="async"
					draggable="false"
				/>

				<span className="hidden min-[440px]:inline text-base font-medium">
					{languages[selectedLang].label}
				</span>

				<ChevronDown
					size={18}
					className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
				/>
			</button>

			{isOpen && (
				<>
					<div className="fixed inset-0 z-10" onClick={toggleDropdown} />
					<div className="absolute mt-2 w-48 bg-base-300 rounded-xl z-20 border border-base-content/10 overflow-hidden anim-fade-in">
						<div className="px-4 py-2 border-b border-base-content/10 bg-base-300">
							<span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
								Seleccionar idioma
							</span>
						</div>

						<div className="py-2">
							{Object.entries(languages).map(([key, { label, img }]) => (
								<button
									type="button"
									key={key}
									onClick={() => selectLanguage(key)}
									className={`flex items-center gap-3 w-full px-4 py-3 text-left cursor-pointer hover:bg-base-100/40 hover:translate-x-1 transition-all duration-200 ${selectedLang === key ? "bg-blue-500/20 text-blue-400" : "text-base-content"}`}
									aria-label={`Cambiar a ${label}`}
								>
									<div className="relative">
										<img
											src={img.src}
											alt={`Bandera de ${label}`}
											className="w-6 h-6 rounded-full object-cover shadow-sm"
											loading="lazy"
											decoding="async"
											draggable="false"
										/>
										{selectedLang === key && (
											<div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full border-2 border-gray-800" />
										)}
									</div>

									<span className="font-medium">{label}</span>

									{selectedLang === key && (
										<div className="ml-auto">
											<div className="w-2 h-2 bg-blue-400 rounded-full" />
										</div>
									)}
								</button>
							))}
						</div>

						<div className="px-4 py-2 border-t border-base-content/10 bg-base-300">
							<span className="text-xs text-gray-500">
								{Object.keys(languages).length} idiomas disponibles
							</span>
						</div>
					</div>
				</>
			)}
		</div>
	);
};
