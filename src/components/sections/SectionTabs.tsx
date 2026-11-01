import { cn } from "cn";
import type { ReactNode } from "react";

export interface SectionTab {
	id: string;
	label: string;
	icon: ReactNode;
}

interface SectionTabsProps {
	items: SectionTab[];
	active: string;
	onChange: (id: string) => void;
	/** Accessible name of the navigation landmark. */
	label: string;
}

/**
 * Tab selector shared by the About and Projects sections.
 *
 * Mobile: a horizontal row of pills (scrolls if it overflows).
 * Desktop (lg): a vertical list of large serif labels in the left column,
 * with a violet rule that grows next to the active one - the section's
 * single focal point is the content on the right, so the selector stays
 * quiet. Native <button>s with aria-pressed keep it keyboard-operable.
 */
export const SectionTabs = ({
	items,
	active,
	onChange,
	label,
}: SectionTabsProps) => (
	<nav
		aria-label={label}
		className="-mx-6 overflow-x-auto px-6 pb-1 lg:mx-0 lg:overflow-visible lg:px-0"
	>
		<ul className="flex gap-2 lg:flex-col lg:gap-1">
			{items.map(({ id, label: text, icon }) => {
				const isActive = id === active;
				return (
					<li key={id} className="shrink-0">
						<button
							type="button"
							aria-pressed={isActive}
							onClick={() => onChange(id)}
							className={cn(
								"group/tab inline-flex min-h-11 w-full cursor-pointer items-center gap-3 whitespace-nowrap rounded-full border px-4 text-sm transition-colors duration-300",
								"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
								"lg:rounded-none lg:border-0 lg:px-0 lg:py-1 lg:font-serif lg:font-normal",
								isActive
									? "border-primary bg-primary text-primary-foreground lg:bg-transparent lg:text-foreground"
									: "border-border text-muted-foreground hover:text-foreground",
							)}
						>
							<span aria-hidden="true" className="lg:hidden">
								{icon}
							</span>
							<span
								aria-hidden="true"
								className={cn(
									"hidden h-px bg-primary transition-[width] duration-500 ease-out lg:block",
									isActive
										? "w-10"
										: "w-0 group-hover/tab:w-4 group-focus-visible/tab:w-4",
								)}
							/>
							{/* Own span: text-heading sets size/line-height and would be merged away by the colour classes above. */}
							<span className="lg:text-heading">{text}</span>
						</button>
					</li>
				);
			})}
		</ul>
	</nav>
);
