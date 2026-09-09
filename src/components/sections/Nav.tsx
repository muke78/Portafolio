import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { getI18N } from "@/i18n";
import { ItemsNav } from "@/features/navbar/ItemsNav";
import { LangDrop } from "@/features/navbar/LangDrop";
import { ThemeDrop } from "@/features/navbar/ThemeSwitch";
import type { PropsLang } from "@/types/currentLang.interface";

export const Nav = ({ currentLocale }: PropsLang) => {
	const [isOpen, setIsOpen] = useState(false);
	const closeSidebar = () => setIsOpen(false);
	const i18n = getI18N({ currentLocale });

	return (
		<nav
			className="fixed left-0 right-0 top-0 w-full backdrop-blur-xl bg-background/80 border-b border-border z-40"
			role="navigation"
		>
			<div className="max-w-[1480px] mx-auto h-[72px] flex justify-between items-center px-6">
				<a
					className="font-serif-display text-[22px] text-foreground flex items-baseline"
					href={`/${currentLocale}/home`}
					aria-label="Khelde."
				>
					Khelde<span className="text-primary">.</span>
				</a>

				<div className="hidden min-[1000px]:flex items-center space-x-8">
					<ul className="flex items-center space-x-8">
						<ItemsNav currentLocale={currentLocale} />
					</ul>
					<div className="flex items-center space-x-4 ml-8 border-l border-border pl-8">
						<LangDrop currentLocale={currentLocale} />
						<ThemeDrop />
					</div>
				</div>

				<div className="min-[1000px]:hidden flex items-center space-x-3">
					<div className="max-[360px]:hidden flex items-center space-x-3">
						<LangDrop currentLocale={currentLocale} />
						<ThemeDrop />
					</div>

					<Sheet open={isOpen} onOpenChange={setIsOpen}>
						<SheetTrigger
							render={
								<Button
									type="button"
									variant="outline"
									size="icon"
									aria-label={i18n.NAVBAR.NAVBAR_OPEN_MENU}
								/>
							}
						>
							<Menu size={24} />
						</SheetTrigger>

						<SheetContent
							side="right"
							className="w-80 max-w-[85vw] flex flex-col"
						>
							<SheetHeader>
								<SheetTitle>{i18n.NAVBAR.NAVBAR_MENU}</SheetTitle>
							</SheetHeader>

							<div className="flex-1 px-6 overflow-y-auto">
								<ul className="space-y-6">
									<ItemsNav
										currentLocale={currentLocale}
										onItemClick={closeSidebar}
									/>
								</ul>
							</div>

							<div className="p-6 border-t border-border">
								<div className="flex justify-start items-center space-x-3">
									<LangDrop currentLocale={currentLocale} />
									<ThemeDrop />
								</div>
							</div>
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</nav>
	);
};
