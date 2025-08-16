import { useTheme } from "@/hooks/useTheme";

import { useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { MoonStar, Sun } from "lucide-react";

export const ThemeDrop = () => {
  const { theme, toggleTheme, mounted } = useTheme();
  const [isHovering, setIsHovering] = useState(false);

  if (!mounted) return null;

  const isDark = theme === "night";

  return (
    <div className="relative">
      <motion.button
        onClick={toggleTheme}
        onHoverStart={() => setIsHovering(true)}
        onHoverEnd={() => setIsHovering(false)}
        className={`
          swap swap-rotate btn btn-circle relative overflow-hidden group
          bg-gradient-to-br transition-all duration-300 border
          ${
            isDark
              ? "from-indigo-500/10 to-purple-600/10 hover:from-indigo-500/20 hover:to-purple-600/20 border-indigo-400/20"
              : "from-amber-400/10 to-orange-500/10 hover:from-amber-400/20 hover:to-orange-500/20 border-amber-400/20"
          }
        `}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        aria-label={`Cambiar a tema ${isDark ? "claro" : "oscuro"}`}
      >
        {/* Efecto de brillo de fondo animado */}
        <motion.div
          className={`
            absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
            bg-gradient-to-r ${
              isDark
                ? "from-purple-500/10 via-indigo-500/5 to-blue-500/10"
                : "from-yellow-400/10 via-orange-400/5 to-red-400/10"
            }
          `}
          animate={{
            background: isDark
              ? [
                  "linear-gradient(45deg, rgba(139, 69, 19, 0.1) 0%, rgba(79, 70, 229, 0.05) 50%, rgba(59, 130, 246, 0.1) 100%)",
                  "linear-gradient(225deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 69, 19, 0.05) 50%, rgba(139, 69, 19, 0.1) 100%)",
                ]
              : [
                  "linear-gradient(45deg, rgba(251, 191, 36, 0.1) 0%, rgba(249, 115, 22, 0.05) 50%, rgba(239, 68, 68, 0.1) 100%)",
                  "linear-gradient(225deg, rgba(239, 68, 68, 0.1) 0%, rgba(251, 191, 36, 0.05) 50%, rgba(251, 191, 36, 0.1) 100%)",
                ],
          }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        />

        {/* Contenedor de iconos con animaciones */}
        <div className="relative z-10 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {isDark ? (
              <motion.span
                key="moon"
                initial={{ rotate: -90, scale: 0, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: 90, scale: 0, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  duration: 0.3,
                }}
                className="text-2xl text-indigo-400 drop-shadow-sm flex items-center justify-center"
              >
                {<MoonStar />}
              </motion.span>
            ) : (
              <motion.span
                key="sun"
                initial={{ rotate: 90, scale: 0, opacity: 0 }}
                animate={{
                  rotate: isHovering ? 180 : 0,
                  scale: 1,
                  opacity: 1,
                }}
                exit={{ rotate: -90, scale: 0, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  duration: 0.3,
                }}
                className="text-2xl text-amber-500 drop-shadow-sm flex items-center justify-center"
              >
                {<Sun />}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Partículas decorativas que aparecen en hover */}
        <AnimatePresence>
          {isHovering && (
            <motion.div className="absolute inset-0 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`absolute w-1 h-1 rounded-full ${
                    isDark ? "bg-indigo-400/60" : "bg-amber-400/60"
                  }`}
                  initial={{
                    opacity: 0,
                    scale: 0,
                    x: "50%",
                    y: "50%",
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: `${50 + Math.cos((i * 60 * Math.PI) / 180) * 25}%`,
                    y: `${50 + Math.sin((i * 60 * Math.PI) / 180) * 25}%`,
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Anillo de pulso sutil */}
        <motion.div
          className={`
            absolute inset-0 rounded-full border-2 opacity-0
            ${isDark ? "border-indigo-400/30" : "border-amber-400/30"}
          `}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.button>
    </div>
  );
};
