import { useEffect, useMemo, useState } from "react";
import type { ItemsNavProps, NavbarItem } from "@/types/currentLang.interface";
import { dataListNavbarEN } from "@/data/locales/en/dataNavbarEN";
import { dataListNavbar } from "@/data/locales/es/dataNavbar";
import { dataListNavbarFR } from "@/data/locales/fr/dataNavbarFR";

const langTraduceData: Record<string, typeof dataListNavbar> = {
	es: dataListNavbar,
	en: dataListNavbarEN,
	fr: dataListNavbarFR,
};

const NAV_HEIGHT = 72;

export const ItemsNav = ({ currentLocale, onItemClick }: ItemsNavProps) => {
	const [activeSection, setActiveSection] = useState<string>("");

	const memorization: NavbarItem[] = useMemo(
		() => langTraduceData[currentLocale] || dataListNavbar,
		[currentLocale],
	);

	useEffect(() => {
		const handleScroll = () => {
			let currentId = "";

			memorization.forEach((item) => {
				const section = document.querySelector(item.to) as HTMLElement;
				if (section) {
					const sectionTop = section.offsetTop - NAV_HEIGHT; // compensar navbar
					const sectionHeight = section.offsetHeight;
					if (
						window.scrollY >= sectionTop &&
						window.scrollY < sectionTop + sectionHeight
					) {
						currentId = item.to;
					}
				}
			});

			setActiveSection(currentId);
		};

		window.addEventListener("scroll", handleScroll);
		handleScroll(); // ejecuta en el montaje
		return () => window.removeEventListener("scroll", handleScroll);
	}, [memorization]);

	const handleClick = () => {
		if (onItemClick && window.innerWidth < 1000) {
			onItemClick(); // solo dispara en mobile
		}
	};

	return (
		<>
			{memorization.map((list) => {
				const isActive = activeSection === list.to;
				return (
					<li key={list.to} className="relative">
						<a
							href={list.to}
							aria-label={`Ir a ${list.label}`}
							onClick={handleClick}
							className={`relative inline-block rounded-full px-3 py-2 text-[13px] transition-colors ${
								isActive
									? "text-foreground"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							{list.label}
							{isActive && (
								<span className="absolute inset-x-3 -bottom-0.5 h-px bg-primary" />
							)}
						</a>
					</li>
				);
			})}
		</>
	);
};
