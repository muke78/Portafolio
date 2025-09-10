import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getI18N } from "@/i18n";
import { languages } from "@/i18n/ui";
import type { PropsLang } from "@/interfaces/currentLang.interface";

export const LangDrop = ({ currentLocale }: PropsLang) => {
	const [selectedLang, setSelectedLang] = useState<string>(currentLocale);
	const [isOpen, setIsOpen] = useState(false);
	const [_i18n, setI18n] = useState(() =>
		getI18N({ currentLocale: currentLocale }),
	);

	const compact = false;

	const dropdownRef = useRef<HTMLDivElement>(null);

	// Obtener el idioma actual de la URL
	useEffect(() => {
		const langFromPath = window.location.pathname.split("/")[1];
		const lang = Object.keys(languages).includes(langFromPath)
			? langFromPath
			: currentLocale;

		setSelectedLang(lang);
		setI18n(getI18N({ currentLocale: lang }));
	}, [currentLocale]);

	// Cerrar dropdown si se hace click afuera
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
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
			{/* Botón Principal */}
			<motion.button
				onClick={toggleDropdown}
				className={`
          ${
						compact
							? "p-2 rounded-lg bg-white/5 hover:bg-white/10"
							: "btn hover:bg-base-content/10 px-3 py-2 rounded-xl"
					} 
          transition-colors duration-200 flex items-center gap-2 border border-base-content/10
        `}
				whileTap={{ scale: 0.95 }}
				whileHover={{ scale: 1.02 }}
				aria-label="Selector para elegir entre tres diferentes idiomas"
			>
				{/* Bandera */}
				<motion.div
					className="relative"
					whileHover={{ scale: 1.1 }}
					transition={{ type: "spring", stiffness: 400, damping: 10 }}
				>
					<img
						src={languages[selectedLang].img.src}
						alt={`Bandera de ${languages[selectedLang].label}`}
						className="w-5 h-5 rounded-full object-cover shadow-sm"
					/>
				</motion.div>

				{/* Texto del idioma (solo en versión normal) */}
				{!compact && (
					<motion.span
						className="hidden min-[440px]:inline text-base font-medium"
						initial={{ opacity: 0, x: -10 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.2 }}
					>
						{languages[selectedLang].label}
					</motion.span>
				)}

				{/* Icono de flecha */}
				<motion.div
					animate={{ rotate: isOpen ? 180 : 0 }}
					transition={{ duration: 0.2, ease: "easeInOut" }}
					className="flex items-center"
				>
					<ChevronDown size={compact ? 16 : 18} className="text-gray-400" />
				</motion.div>
			</motion.button>

			{/* Dropdown Menu */}
			<AnimatePresence>
				{isOpen && (
					<>
						{/* Backdrop para cerrar */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="fixed inset-0 z-10"
							onClick={toggleDropdown}
						/>

						{/* Menu desplegable */}
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: -10 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: -10 }}
							transition={{
								type: "spring",
								damping: 20,
								stiffness: 300,
								duration: 0.2,
							}}
							className={`
                absolute mt-2 w-48 bg-base-300 rounded-xl z-20 border border-base-content/10 
                overflow-hidden
              
              `}
						>
							{/* Header del dropdown */}
							<div className="px-4 py-2 border-b border-base-content/10 bg-base-300">
								<span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
									Seleccionar idioma
								</span>
							</div>

							{/* Lista de idiomas */}
							<div className="py-2">
								{Object.entries(languages).map(
									([key, { label, img }], index) => (
										<motion.button
											key={key}
											onClick={() => selectLanguage(key)}
											className={`
                      flex items-center gap-3 w-full px-4 py-3 text-left cursor-pointer
                      hover:bg-base-100/40 transition-discrete duration-200 group
                      ${selectedLang === key ? "bg-blue-500/20 text-blue-400" : "text-base-content"}
                    `}
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: index * 0.05 }}
											whileHover={{ x: 4 }}
											aria-label={`Cambiar a ${label}`}
										>
											{/* Bandera */}
											<motion.div
												className="relative"
												whileHover={{ scale: 1.1 }}
												transition={{
													type: "spring",
													stiffness: 400,
													damping: 10,
												}}
											>
												<img
													src={img.src}
													alt={`Bandera de ${label}`}
													className="w-6 h-6 rounded-full object-cover shadow-sm"
												/>

												{/* Indicador de selección */}
												{selectedLang === key && (
													<motion.div
														initial={{ scale: 0 }}
														animate={{ scale: 1 }}
														className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full border-2 border-gray-800"
													/>
												)}
											</motion.div>

											{/* Nombre del idioma */}
											<span className="font-medium transition-colors duration-200">
												{label}
											</span>

											{/* Checkmark para idioma seleccionado */}
											{selectedLang === key && (
												<motion.div
													initial={{ opacity: 0, scale: 0 }}
													animate={{ opacity: 1, scale: 1 }}
													className="ml-auto"
												>
													<div className="w-2 h-2 bg-blue-400 rounded-full" />
												</motion.div>
											)}
										</motion.button>
									),
								)}
							</div>

							{/* Footer opcional con info adicional */}
							<div className="px-4 py-2 border-t border-base-content/10 bg-base-300">
								<span className="text-xs text-gray-500">
									{Object.keys(languages).length} idiomas disponibles
								</span>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</div>
	);
};
