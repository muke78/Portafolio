import { getI18N } from "@/i18n";
import type { DataTestimonials } from "@/interfaces/currentLang.interface";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0,
    },
  },
};

const cardVariants = {
  left: {
    hidden: { opacity: 0, x: -100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  },
  bottom: {
    hidden: { opacity: 0, y: 100 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  },
};

export const Testimonials = ({ currentLocale, data }: DataTestimonials) => {
  const i18n = getI18N({ currentLocale });

  return (
    <div className="relative max-w-full overflow-hidden lg:p-9 md:p-8 p-4">
      <motion.div
        className="flex flex-col text-center mb-12"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="inline-block px-4 py-2 bg-primary/30 text-primary text-sm font-medium rounded-full mb-4 mx-auto"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {i18n.OPINIONS.OPINIONS_SUBTITLE}
        </motion.div>
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          {i18n.OPINIONS.OPINIONS_TITLE}
        </h2>
        <p className="text-xl text-base-content/50 font-medium">
          {i18n.OPINIONS.OPINIONS_SUB_SUBTILE}
        </p>
      </motion.div>

      <motion.div
        className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        viewport={{ once: true }}
      >
        {data.map((testimonial) => (
          <motion.div
            key={testimonial.id}
            variants={
              cardVariants[testimonial.direction as keyof typeof cardVariants]
            }
            whileHover={{
              y: -10,
              transition: { duration: 0.4 },
            }}
            className="group relative break-inside-avoid bg-base-100 rounded-lg shadow-lg hover:bg-gradient-to-br from-secondary/50 via-secondary/10 to-transparent opacity-0 hover:shadow-xl transition-all duration-300 p-6 mb-6"
          >
            <div className="flex items-start gap-4 mb-4">
              <Quote className="w-10 h-10 text-secondary flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">{testimonial.name}</h3>
                <p className="text-sm font-medium">{testimonial.job}</p>
              </div>
            </div>

            <p className="text-base-content/50 leading-relaxed flex-1">
              {testimonial.description}
            </p>

            {/* Border animado desde el centro */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-secondary transform scale-x-0 group-hover:scale-x-100"></div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
