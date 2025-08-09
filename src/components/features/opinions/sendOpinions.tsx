import { comments } from "@/db/schema";
import { getI18N } from "@/i18n";
import type {
  FormOpinions,
  PropsLang,
} from "@/interfaces/currentLang.interface";
import { db } from "@/lib/db";
import { opinionsSchema } from "@/schemas/opinionsSchema";

import { useState } from "react";
import { type FieldError, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Briefcase, Check, MessageSquare, Send, User } from "lucide-react";

export const SendOpinions = ({ currentLocale }: PropsLang) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const i18n = getI18N({ currentLocale });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormOpinions>({
    resolver: zodResolver(opinionsSchema({ currentLocale })),
    defaultValues: {
      name: "",
      job: "",
      description: "",
    },
  });

  const onSubmit = async (save: FormOpinions) => {
    setIsLoading(true);
    try {
      // Contar los comentarios actuales para alternar la dirección
      const existing = await db.select().from(comments);
      const direction = existing.length % 2 === 0 ? "left" : "bottom";

      const { name, job, description } = save;
      await db.insert(comments).values({
        name,
        job,
        description,
        direction,
      });
    } catch (error) {
      console.error("Funciona ptm", error);
    }

    setIsLoading(false);
    setIsSubmitted(true);
    reset();
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

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

  if (isSubmitted) {
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
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 lg:w-3xl md:w-2xl sm:w-xl">
      <motion.div
        className="w-full max-w"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="bg-base-100 rounded-xl shadow-xl overflow-hidden"
          variants={itemVariants}
        >
          {/* Header con gradiente */}
          <div className="bg-gradient-to-r from-primary to-accent p-6 text-center">
            <motion.div
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <MessageSquare className="w-12 h-12 text-base-200 mx-auto mb-3" />
            </motion.div>
            <motion.h2
              className="text-3xl font-bold text-base-200"
              variants={itemVariants}
            >
              {i18n.OPINIONS.OPINIONS_FORM_TITLE}
            </motion.h2>
            <motion.p className="text-base-200/90 mt-2" variants={itemVariants}>
              {i18n.OPINIONS.OPINIONS_FORM_SUBTITLE}
            </motion.p>
          </div>

          {/* Formulario */}
          <div className="p-8 space-y-6">
            <form
              onSubmit={handleSubmit(onSubmit)}
              method="POST"
              className="space-y-6"
            >
              {/* Campo Nombre */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="flex items-center text-sm font-medium mb-2">
                  <User className="w-4 h-4 mr-2 text-secondary" />
                  {i18n.FORM.INPUT_NAME}{" "}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <motion.input
                  type="text"
                  placeholder={i18n.OPINIONS.OPINIONS_FORM_JOB_PLACEHOLDER}
                  className="input input-lg w-full"
                  whileFocus={{ scale: 1.02 }}
                  {...register("name")}
                />
                {errors.name && (
                  <motion.p
                    className="text-red-500 text-sm mt-1 flex items-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {(errors.name as FieldError)?.message}
                  </motion.p>
                )}
              </motion.div>

              {/* Campo Puesto (Opcional) */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="flex items-center text-sm font-medium mb-2">
                  <Briefcase className="w-4 h-4 mr-2 text-secondary" />
                  {i18n.FORM.INPUT_JOB}
                  <span className="text-gray-400 text-xs ml-2">
                    ({i18n.FORM.INPUT_JOB_INPUT_OPTIONAL})
                  </span>
                </label>
                <motion.input
                  type="text"
                  placeholder={i18n.OPINIONS.OPINIONS_FORM_JOB_PLACEHOLDER}
                  className="input input-lg w-full"
                  whileFocus={{ scale: 1.02 }}
                  {...register("job")}
                />
                {errors.job && (
                  <motion.p
                    className="text-red-500 text-sm mt-1 flex items-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {(errors.job as FieldError)?.message}
                  </motion.p>
                )}
              </motion.div>

              {/* Campo Descripción */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="flex items-center text-sm font-medium mb-2">
                  <MessageSquare className="w-4 h-4 mr-2 text-secondary" />
                  {i18n.FORM.INPUT_TELL_EXPERIENCE}{" "}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <motion.textarea
                  rows={4}
                  placeholder={i18n.OPINIONS.OPINIONS_FORM_EXP_PLACEHOLDER}
                  className="textarea textarea-lg w-full"
                  whileFocus={{ scale: 1.02 }}
                  {...register("description")}
                />
                {errors.description && (
                  <motion.p
                    className="text-red-500 text-sm mt-1 flex items-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {(errors.description as FieldError)?.message}
                  </motion.p>
                )}
              </motion.div>

              {/* Botón de envío */}
              <motion.button
                type="submit"
                disabled={isLoading}
                variants={itemVariants}
                className="btn btn-xl bg-gradient-to-r from-primary to-accent text-base-200 btn-wide max-w-full mt-2"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center space-x-2"
                    >
                      <motion.div
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                      <span>
                        {i18n.OPINIONS.OPINIONS_LOAD_SEND_INFORMATION}
                      </span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="submit"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center space-x-2"
                    >
                      <Send className="w-5 h-5" />
                      <span>{i18n.OPINIONS.OPINIONS_SEND_INFORMATION}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
