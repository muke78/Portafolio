import { getI18N } from "@/i18n";
import type { PropsLang } from "@/interfaces/currentLang.interface";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const successVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      duration: 0.8,
    },
  },
};

export const SubmittedOpinion = ({ currentLocale }: PropsLang) => {
  const i18n = getI18N({ currentLocale });
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        variants={successVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="bg-base-100 rounded-3xl shadow-xl p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-10 h-10 text-green-500" />
          </motion.div>

          <motion.h2
            className="text-2xl font-bold mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {i18n.OPINIONS.OPINIONS_SEND_SUCCESSFULL}
          </motion.h2>

          <motion.p
            className="text-base-content/60 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {i18n.OPINIONS.OPINIONS_SEND_SUCCESSFULL_INFORMATION}
          </motion.p>

          <motion.a
            href="home#opinions"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-medium transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {i18n.OPINIONS.OPINIONS_REDIRECT_COMMENTS}
          </motion.a>
        </div>
      </motion.div>
    </div>
  );
};
