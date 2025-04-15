import { useTheme } from "@/hooks/useTheme";
import { v } from "@/styles/variables";

export const ThemeDrop: React.FC = () => {
  const { changeTheme, setChangeTheme, mounted } = useTheme();

  const toggleTheme = () => {
    setChangeTheme((prevTheme) =>
      prevTheme === "winter" ? "night" : "winter",
    );
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      className="swap swap-rotate btn btn-circle"
      aria-label="Cambio de tema"
    >
      {changeTheme === "night" ? (
        <span className="text-2xl">{v.iconoLuna && <v.iconoLuna />}</span>
      ) : (
        <span className="text-2xl">{v.iconoSol && <v.iconoSol />}</span>
      )}
    </button>
  );
};
