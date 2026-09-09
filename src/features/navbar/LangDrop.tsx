import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { ReactCountryFlag } from "react-country-flag";
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
import { isLocale, LOCALE_META, LOCALES } from "@/i18n/locales";
import type { PropsLang } from "@/types/currentLang.interface";

export const LangDrop = ({ currentLocale }: PropsLang) => {
	const [selectedLang, setSelectedLang] = useState<string>(currentLocale);
	const [i18n, setI18n] = useState(() =>
		getI18N({ currentLocale: currentLocale }),
	);

	useEffect(() => {
		const langFromPath = window.location.pathname.split("/")[1];
		const lang = isLocale(langFromPath) ? langFromPath : currentLocale;

		setSelectedLang(lang);
		setI18n(getI18N({ currentLocale: lang }));
	}, [currentLocale]);

	const selectLanguage = (lang: string) => {
		if (lang === selectedLang) return;
		// Preserva query string y hash al cambiar de idioma.
		const { search, hash, pathname } = window.location;
		const restOfPath = pathname.split("/").slice(2).join("/");
		window.location.href = `/${lang}/${restOfPath}${search}${hash}`;
	};

	const activeMeta = LOCALE_META[isLocale(selectedLang) ? selectedLang : "es"];

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button
						type="button"
						variant="outline"
						className="gap-2 rounded-xl px-3"
					>
						<ReactCountryFlag
							countryCode={activeMeta.countryCode}
							svg
							style={{
								width: "1.15em",
								height: "1.15em",
								borderRadius: "9999px",
							}}
							title={`${i18n.NAVBAR.NAVBAR_FLAG_OF} ${activeMeta.label}`}
						/>
						<span className="hidden min-[440px]:inline text-base font-medium">
							{activeMeta.label}
						</span>
						<ChevronDown size={18} className="text-muted-foreground" />
					</Button>
				}
			/>

			<DropdownMenuContent align="end" className="w-48">
				<DropdownMenuGroup>
					<DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
						{i18n.NAVBAR.NAVBAR_SELECT_LANGUAGE}
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					{LOCALES.map((key) => {
						const meta = LOCALE_META[key];
						return (
							<DropdownMenuItem
								key={key}
								onClick={() => selectLanguage(key)}
								aria-label={`${i18n.NAVBAR.NAVBAR_CHANGE_TO} ${meta.label}`}
								className="gap-3"
								data-selected={selectedLang === key || undefined}
							>
								<ReactCountryFlag
									countryCode={meta.countryCode}
									svg
									style={{
										width: "1.25em",
										height: "1.25em",
										borderRadius: "9999px",
									}}
									title={`${i18n.NAVBAR.NAVBAR_FLAG_OF} ${meta.label}`}
								/>
								<span className="font-medium">{meta.label}</span>
								{selectedLang === key && (
									<span className="ml-auto h-2 w-2 rounded-full bg-primary" />
								)}
							</DropdownMenuItem>
						);
					})}
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<div className="px-2 py-1.5 text-xs font-normal text-muted-foreground">
					{LOCALES.length} {i18n.NAVBAR.NAVBAR_LANGUAGES_AVAILABLE}
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
