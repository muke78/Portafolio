import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getI18N } from "@/i18n";
import { languages } from "@/i18n/ui";
import type { PropsLang } from "@/types/currentLang.interface";

export const LangDrop = ({ currentLocale }: PropsLang) => {
	const [selectedLang, setSelectedLang] = useState<string>(currentLocale);
	const [_i18n, setI18n] = useState(() =>
		getI18N({ currentLocale: currentLocale }),
	);

	useEffect(() => {
		const langFromPath = window.location.pathname.split("/")[1];
		const lang = Object.keys(languages).includes(langFromPath)
			? langFromPath
			: currentLocale;

		setSelectedLang(lang);
		setI18n(getI18N({ currentLocale: lang }));
	}, [currentLocale]);

	const selectLanguage = (lang: string) => {
		if (lang === selectedLang) return;
		const currentHash = window.location.hash;
		const currentSearch = window.location.search;
		const newPath = `/${lang}/${window.location.pathname.split("/").slice(2).join("/")}${currentSearch}${currentHash}`;
		window.location.href = newPath;
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button
						type="button"
						variant="outline"
						className="gap-2 rounded-xl px-3"
					>
						<img
							src={languages[selectedLang].img.src}
							alt={`Bandera de ${languages[selectedLang].label}`}
							className="h-5 w-5 rounded-full object-cover shadow-sm"
							loading="lazy"
							decoding="async"
							draggable="false"
						/>
						<span className="hidden min-[440px]:inline text-base font-medium">
							{languages[selectedLang].label}
						</span>
						<ChevronDown size={18} className="text-muted-foreground" />
					</Button>
				}
			/>

			<DropdownMenuContent align="end" className="w-48">
				<DropdownMenuGroup>
					<DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
						Seleccionar idioma
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					{Object.entries(languages).map(([key, { label, img }]) => (
						<DropdownMenuItem
							key={key}
							onClick={() => selectLanguage(key)}
							aria-label={`Cambiar a ${label}`}
							className="gap-3"
							data-selected={selectedLang === key || undefined}
						>
							<img
								src={img.src}
								alt={`Bandera de ${label}`}
								className="h-6 w-6 rounded-full object-cover shadow-sm"
								loading="lazy"
								decoding="async"
								draggable="false"
							/>
							<span className="font-medium">{label}</span>
							{selectedLang === key && (
								<span className="ml-auto h-2 w-2 rounded-full bg-primary" />
							)}
						</DropdownMenuItem>
					))}
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<div className="px-2 py-1.5 text-xs font-normal text-muted-foreground">
					{Object.keys(languages).length} idiomas disponibles
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
