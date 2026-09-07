import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ItemsNav } from "@/features/navbar/ItemsNav";
import { LangDrop } from "@/features/navbar/LangDrop";
import { ThemeDrop } from "@/features/navbar/ThemeSwitch";
import type { PropsLang } from "@/types/currentLang.interface";

export const Nav = ({ currentLocale }: PropsLang) => {
	const [isOpen, setIsOpen] = useState(false);
	const sidebarRef = useRef<HTMLDivElement>(null);

	const toggleSidebar = () => setIsOpen(!isOpen);
	const closeSidebar = () => setIsOpen(false);

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
				<a
					className="font-semibold text-2xl text-base-content"
					href={`/${currentLocale}/home`}
					aria-label="Khelde."
				>
					Khelde.
				</a>

				<div className="hidden min-[1000px]:flex items-center space-x-8">
					<ul className="flex items-center space-x-8">
						<ItemsNav currentLocale={currentLocale} />
					</ul>
					<div className="flex items-center space-x-4 ml-8 border-l border-base-content/10 pl-8">
						<LangDrop currentLocale={currentLocale} />
						<ThemeDrop />
					</div>
				</div>

				<div className="min-[1000px]:hidden flex items-center space-x-3">
					<div className="max-[360px]:hidden flex items-center space-x-3">
						<LangDrop currentLocale={currentLocale} />
						<ThemeDrop />
					</div>

					<button
						type="button"
						onClick={toggleSidebar}
						className="p-2 rounded-lg bg-base-content/5 hover:bg-base-content/10 active:scale-95 transition-all duration-200 border border-base-content/10"
						aria-label="Abrir menú"
					>
						<Menu size={24} />
					</button>
				</div>
			</div>

			{isOpen && (
				<div
					className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 anim-fade-in"
					onClick={closeSidebar}
				/>
			)}

			{isOpen && (
				<div
					ref={sidebarRef}
					className="fixed top-0 right-0 max-h-screen w-80 max-w-[85vw] bg-base-300 border-l border-base-content/10 rounded-b-2xl shadow-2xl z-50 anim-slide-in-right"
				>
					<div className="flex items-center justify-between p-5 border-b border-base-content/10">
						<h3 className="text-xl font-semibold">Menú</h3>
						<button
							type="button"
							onClick={closeSidebar}
							className="p-2 rounded-lg bg-base-content/5 hover:bg-base-content/10 active:scale-95 transition-all duration-200 border border-base-content/10"
							aria-label="Cerrar menú"
						>
							<X size={20} className="text-base-content" />
						</button>
					</div>

					<div className="flex flex-col h-full">
						<div className="flex-1 px-6 py-8 bg-base-300">
							<ul className="space-y-6">
								<ItemsNav
									currentLocale={currentLocale}
									onItemClick={closeSidebar}
								/>
							</ul>
						</div>

						<div className="p-6 border-t rounded-b-2xl border-base-content/10 bg-base-300">
							<div className="flex justify-start items-center space-x-4">
								<div className="flex space-x-3">
									<LangDrop currentLocale={currentLocale} />
									<ThemeDrop />
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</nav>
	);
};
