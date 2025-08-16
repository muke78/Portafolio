import { SubmittedOpinion } from "@/components/features/opinions/SubmittedOpinion";
import { getI18N } from "@/i18n";
import type {
  FormOpinions,
  PropsLang,
} from "@/interfaces/currentLang.interface";
import { opinionsSchema } from "@/schemas/opinionsSchema";
import { postCommentsServices } from "@/services/comments/comments.services";

import { useState } from "react";
import { type FieldError, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Briefcase, MessageSquare, Send, User } from "lucide-react";

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

    const { name, job, description } = save;

    await postCommentsServices({ name, job, description });

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

  if (isSubmitted) {
    return <SubmittedOpinion currentLocale={currentLocale} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center overflow-scroll lg:overflow-hidden p-4 lg:w-3xl md:w-2xl sm:w-xl">
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
          <div className="bg-gradient-to-r from-primary via-secondary/70 to-accent p-6 text-center">
            <motion.div
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <MessageSquare className="w-12 h-12 text-base-200 mx-auto mb-3" />
            </motion.div>
            <motion.h2
              className="lg:text-3xl md:text-2xl text-xl font-bold text-base-200"
              variants={itemVariants}
            >
              {i18n.OPINIONS.OPINIONS_FORM_TITLE}
            </motion.h2>
            <motion.p
              className="lg:text-2xl md:text-xl text-md text-base-200/80 mt-2"
              variants={itemVariants}
            >
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
                  placeholder={i18n.OPINIONS.OPINIONS_FORM_NAME_PLACEHOLDER}
                  className="input lg:input-lg input-md w-full"
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
                  className="input lg:input-lg input-md w-full"
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
                  className="textarea lg:textarea-lg textarea-md w-full"
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
                className="btn xl:btn-xl lg:btn-lg btn-md bg-gradient-to-r from-primary via-secondary/70 to-accent text-base-200 btn-wide max-w-full"
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
