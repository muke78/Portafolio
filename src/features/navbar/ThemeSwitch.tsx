import { MoonStar, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

export const ThemeDrop = () => {
	const { theme, toggleTheme, mounted } = useTheme();

	if (!mounted) {
		return (
			<Button
				type="button"
				variant="outline"
				size="icon"
				aria-hidden="true"
				tabIndex={-1}
				className="rounded-full"
			>
				<span className="opacity-0">
					<Sun size={20} />
				</span>
			</Button>
		);
	}

	const isDark = theme === "dark";

	return (
		<Button
			type="button"
			variant="outline"
			size="icon"
			onClick={toggleTheme}
			className="rounded-full"
			aria-label={`Cambiar a tema ${isDark ? "claro" : "oscuro"}`}
		>
			{isDark ? <MoonStar size={20} /> : <Sun size={20} />}
		</Button>
	);
};
