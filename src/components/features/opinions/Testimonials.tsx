import { getI18N } from "@/i18n";
import type { DataTestimonials } from "@/interfaces/currentLang.interface";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  left: {
    hidden: { opacity: 0, x: -50, scale: 0.95 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  },
  bottom: {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  },
};

const emptyStateVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

export const Testimonials = ({ currentLocale, data }: DataTestimonials) => {
  const i18n = getI18N({ currentLocale });

  return (
    <div className="relative max-w-full overflow-hidden lg:p-9 md:p-8 p-4">
      {/* Header Section */}
      <motion.div
        className="flex flex-col text-center mb-12"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="inline-block px-4 py-2 bg-primary/20 text-primary text-sm font-medium rounded-full mb-6 mx-auto backdrop-blur-sm border border-primary/20"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5, ease: "backOut" }}
        >
          {i18n.OPINIONS.OPINIONS_SUBTITLE}
        </motion.div>

        <motion.h2
          className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-base-content to-base-content/70 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {i18n.OPINIONS.OPINIONS_TITLE}
        </motion.h2>

        <motion.p
          className="text-xl text-base-content/60 font-medium max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          {i18n.OPINIONS.OPINIONS_SUB_SUBTILE}
        </motion.p>
      </motion.div>

      {/* Content Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        viewport={{ once: true }}
      >
        {data.length === 0 ? (
          // Estado vacío mejorado
          <motion.div
            className="flex flex-col items-center justify-center min-h-[400px] px-8 py-12"
            variants={emptyStateVariants}
            aria-live="polite"
          >
            {/* Contenedor de imagen con decoraciones */}
            <motion.div
              className="relative mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
                delay: 0.2,
              }}
            >
              {/* Imagen principal */}
              <motion.img
                src="/no_data.svg"
                alt="No hay información disponible"
                aria-label="No hay información disponible por el momento"
                className="w-52 h-52 mx-auto opacity-70"
                animate={{
                  y: [0, -12, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Círculo decorativo giratorio */}
              <motion.div
                className="absolute -inset-6 rounded-full border-2 border-dashed border-primary/30"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />

              {/* Partículas decorativas */}
              <motion.div
                className="absolute -top-2 -right-2 w-3 h-3 bg-primary/40 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.4, 0.8, 0.4],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 0,
                }}
              />
              <motion.div
                className="absolute -bottom-2 -left-2 w-2 h-2 bg-secondary/40 rounded-full"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.4, 0.7, 0.4],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 1,
                }}
              />
            </motion.div>

            {/* Texto mejorado */}
            <motion.div
              className="text-center space-y-4 max-w-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <h3 className="text-2xl font-semibold text-base-content/80 mb-3">
                {i18n.OPINIONS.OPINIONS_NOT_FOUND}
              </h3>
              <p className="text-sm text-primary/60 leading-relaxed">
                {i18n.OPINIONS.OPINIONS_NOT_FOUND_DESCRIPTION}
              </p>
            </motion.div>
          </motion.div>
        ) : (
          // Grid de testimonios mejorado
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {data.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                variants={
                  cardVariants[
                    testimonial.direction as keyof typeof cardVariants
                  ]
                }
                whileHover={{
                  y: -8,
                  scale: 1.02,
                  transition: { duration: 0.3, ease: "easeOut" },
                }}
                className="group relative break-inside-avoid bg-base-100 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 mb-6 border border-base-300/50 backdrop-blur-sm"
              >
                {/* Header con Quote */}
                <div className="flex items-start gap-4 mb-5">
                  <motion.div
                    className="flex-shrink-0 p-2.5 rounded-full bg-gradient-to-br from-secondary/20 to-secondary/10 border border-secondary/20"
                    whileHover={{
                      rotate: 15,
                      scale: 1.1,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <Quote className="w-5 h-5 text-secondary" />
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base-content text-lg leading-tight mb-1 truncate">
                      {testimonial.name}
                    </h3>
                    <p className="text-sm text-base-content/70 font-medium">
                      {testimonial.job}
                    </p>
                  </div>
                </div>

                {/* Contenido */}
                <p className="text-base-content/70 leading-relaxed text-sm line-clamp-6 mb-4">
                  {testimonial.description}
                </p>

                {/* Indicador animado */}
                <motion.div
                  className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-secondary via-primary to-secondary rounded-full origin-center"
                  initial={{ scaleX: 0, opacity: 0 }}
                  whileHover={{
                    scaleX: 1,
                    opacity: 1,
                  }}
                  transition={{
                    duration: 0.4,
                    ease: "easeOut",
                  }}
                />

                {/* Efecto de brillo sutil */}
                <motion.div
                  className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  initial={false}
                />

                {/* Borde decorativo */}
                <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-primary/20 transition-colors duration-300" />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
