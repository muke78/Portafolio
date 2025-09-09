import { ItemsNav } from "@/components/features/navbar/ItemsNav";
import { LangDrop } from "@/components/features/navbar/LangDrop";
import { ThemeDrop } from "@/components/features/navbar/ThemeSwitch";
import type { PropsLang } from "@/interfaces/currentLang.interface";

import { useEffect, useRef, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

export const Nav = ({ currentLocale }: PropsLang) => {
	const [isOpen, setIsOpen] = useState(false);
	const sidebarRef = useRef<HTMLDivElement>(null);

	const toggleSidebar = () => setIsOpen(!isOpen);
	const closeSidebar = () => setIsOpen(false);

	// Cerrar al click afuera o Esc
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				isOpen &&
				sidebarRef.current &&
				!sidebarRef.current.contains(e.target as Node) &&
				window.innerWidth < 1000
			) {
				closeSidebar();
			}
		};

		const handleEsc = (e: KeyboardEvent) => {
			if (isOpen && e.key === "Escape") {
				closeSidebar();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleEsc);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleEsc);
		};
	}, [isOpen]);

	return (
		<nav
			className="fixed left-0 right-0 top-0 w-full backdrop-blur-xl bg-base-content/5 border-b border-base-content/10 z-40"
			role="navigation"
		>
			<div className="max-w-7xl mx-auto h-20 flex justify-between items-center px-6">
				{/* Logo */}
				<motion.a
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					className="font-semibold text-2xl text-base-content"
					href={`/${currentLocale}/home`}
					aria-label="Pagina principal, portafolio de Erick González"
				>
					Khelde.
				</motion.a>

				{/* Navegación Desktop */}
				<div className="hidden min-[1000px]:flex items-center space-x-8">
					<ul className="flex items-center space-x-8">
						<ItemsNav currentLocale={currentLocale} />
					</ul>

					{/* Controles Desktop */}
					<div className="flex items-center space-x-4 ml-8 border-l border-base-content/10 pl-8">
						<LangDrop currentLocale={currentLocale} />
						<ThemeDrop />
					</div>
				</div>

				{/* Controles Mobile */}
				<div className="min-[1000px]:hidden flex items-center space-x-3">
					<div className="max-[430px]:hidden flex items-center space-x-3">
						<LangDrop currentLocale={currentLocale} />
						<ThemeDrop />
					</div>

					{/* Botón Menú Mobile */}
					<motion.button
						onClick={toggleSidebar}
						className="p-2 rounded-lg bg-base-content/5 hover:bg-base-content/10 transition-colors duration-200 border border-base-content/10"
						aria-label="Abrir menú"
						whileTap={{ scale: 0.95 }}
					>
						<Menu size={24} />
					</motion.button>
				</div>
			</div>

			{/* Overlay */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
						onClick={closeSidebar}
					/>
				)}
			</AnimatePresence>

			{/* Sidebar Mobile */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						ref={sidebarRef}
						initial={{ x: "100%", opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						exit={{ x: "100%", opacity: 0 }}
						transition={{
							type: "spring",
							damping: 25,
							stiffness: 300,
							opacity: { duration: 0.2 },
						}}
						className="fixed top-0 right-0 max-h-screen w-80 max-w-[85vw] bg-base-300 border-l border-base-content/10 rounded-b-2xl shadow-2xl z-50"
					>
						{/* Header del Sidebar */}
						<div className="flex items-center justify-between p-5 border-b border-base-content/10">
							<h3 className="text-xl font-semibold">Menú</h3>
							<motion.button
								onClick={closeSidebar}
								className="p-2 rounded-lg bg-base-content/5 hover:bg-base-content/10 transition-colors duration-200 border border-base-content/10"
								aria-label="Cerrar menú"
								whileTap={{ scale: 0.95 }}
							>
								<X size={20} className="text-base-content" />
							</motion.button>
						</div>

						{/* Contenido del Sidebar */}
						<div className="flex flex-col h-full">
							{/* Navegación */}
							<div className="flex-1 px-6 py-8 bg-base-300">
								<motion.ul
									className="space-y-6"
									initial={{ y: 20, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									transition={{ delay: 0.1, staggerChildren: 0.05 }}
								>
									<ItemsNav
										currentLocale={currentLocale}
										onItemClick={closeSidebar}
									/>
								</motion.ul>
							</div>

							{/* Footer del Sidebar */}
							<div className="p-6 border-t rounded-b-2xl border-base-content/10 bg-base-300">
								<div className="flex justify-start items-center space-x-4">
									<div className="flex space-x-3">
										<LangDrop currentLocale={currentLocale} />
										<ThemeDrop />
									</div>
								</div>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</nav>
	);
};
