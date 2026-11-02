import { useEffect, useMemo, useState } from "react";
import { dataListNavbarEN } from "@/data/locales/en/dataNavbarEN";
import { dataListNavbar } from "@/data/locales/es/dataNavbar";
import { dataListNavbarFR } from "@/data/locales/fr/dataNavbarFR";
import type { ItemsNavProps, NavbarItem } from "@/types/currentLang.interface";

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
		// The active link is the last section whose top has reached the upper
		// part of the screen. Positions come from getBoundingClientRect (never
		// offsetTop: pinned sections live inside pin-spacers, so offsets are not
		// document positions) and are read at most once per frame.
		let frame = 0;
		const compute = () => {
			frame = 0;
			let currentId = "";
			const line = NAV_HEIGHT + window.innerHeight * 0.35;
			for (const item of memorization) {
				const section = document.querySelector(item.to);
				if (section && section.getBoundingClientRect().top <= line) {
					currentId = item.to;
				}
			}
			// At the very end the last section may be too short to reach the line.
			const atBottom =
				window.innerHeight + window.scrollY >=
				document.documentElement.scrollHeight - 4;
			if (atBottom && memorization.length) {
				currentId = memorization[memorization.length - 1].to;
			}
			setActiveSection((prev) => (prev === currentId ? prev : currentId));
		};
		const schedule = () => {
			if (!frame) frame = requestAnimationFrame(compute);
		};

		window.addEventListener("scroll", schedule, { passive: true });
		window.addEventListener("resize", schedule);
		compute(); // on mount
		return () => {
			window.removeEventListener("scroll", schedule);
			window.removeEventListener("resize", schedule);
			cancelAnimationFrame(frame);
		};
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
							className={`relative inline-flex min-h-11 items-center rounded-full px-3 text-base transition-colors ${
								isActive
									? "text-foreground"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							{list.label}
							{isActive && (
								<span className="absolute inset-x-3 bottom-2 h-px bg-primary" />
							)}
						</a>
					</li>
				);
			})}
		</>
	);
};
