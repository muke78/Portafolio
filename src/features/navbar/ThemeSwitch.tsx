import { MoonStar, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export const ThemeDrop = () => {
	const { theme, toggleTheme, mounted } = useTheme();

	if (!mounted) {
		return (
			<button
				type="button"
				aria-hidden="true"
				className="btn btn-circle bg-base-content/5 border border-base-content/10"
				tabIndex={-1}
			>
				<span className="opacity-0">
					<Sun size={20} />
				</span>
			</button>
		);
	}

	const isDark = theme === "night";

	return (
		<button
			type="button"
			onClick={toggleTheme}
			className={`btn btn-circle border transition-colors duration-200 ${
				isDark
					? "bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-400/20 text-indigo-400"
					: "bg-amber-400/10 hover:bg-amber-400/20 border-amber-400/20 text-amber-500"
			}`}
			aria-label={`Cambiar a tema ${isDark ? "claro" : "oscuro"}`}
		>
			{isDark ? <MoonStar size={20} /> : <Sun size={20} />}
		</button>
	);
};
