import { useTheme } from "@/hooks/useTheme";
import { getI18N } from "@/i18n";
import type { FormData, PropsLang } from "@/interfaces/currentLang.interface";
import { contactSchema } from "@/schemas/contactSchema";

import { type FieldError, useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";

import { zodResolver } from "@hookform/resolvers/zod";
import { VITE_BOT_TOKEN, VITE_CHAT_ID } from "astro:env/client";
import { motion } from "framer-motion";
import { Mail, Phone, Send } from "lucide-react";

export const Form = ({ currentLocale }: PropsLang) => {
  const { changeTheme } = useTheme();

  const i18n = getI18N({ currentLocale });
  const sendInformationValid = `${i18n.FORM.FORM_SEND_INFORMATION_CORRECT}`;
  const errorSendInformation = `${i18n.FORM.FORM_SEND_INFORMATION_INCORRECT}`;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(contactSchema({ currentLocale })),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      moreInformation: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    const botToken = VITE_BOT_TOKEN;
    const chatId = VITE_CHAT_ID;

    if (!botToken || !chatId) {
      toast.error("No se encontraron credenciales de Telegram.", {
        duration: 5000,
        position: "bottom-right",
      });
      return;
    }

    const message = `📩 *Nuevo formulario enviado*\n
  🔹 *Nombre:* ${data.name}
  🔹 *Email:* ${data.email}
  🔹 *Teléfono:* ${data.phone}
  🔹 *Más información:* ${data.moreInformation}`;

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "Markdown",
        }),
      });
      toast.success(sendInformationValid, {
        duration: 5000,
        position: "bottom-right",
      });
      reset();
    } catch (error) {
      toast.error(`${errorSendInformation}, ${error}`, {
        duration: 5000,
        position: "bottom-right",
      });
      console.error("Error:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 grid-rows-2 md:grid-rows-1 gap-3 md:gap-3 lg:p-9 md:p-8 p-4">
      <div className="col-start-1 row-start-1 md:col-span-1 md:row-span-1 rounded-md space-y-1 text-base-content">
        <small className="block font-medium text-base-content/40">
          {i18n.FORM.FORM_TITLE_SMALL_SUBHEADER}
        </small>

        <h2 className="text-4xl lg:text-6xl font-bold leading-tight">
          {i18n.FORM.FORM_TITLE_HEAD_STRONG}{" "}
          <span className="text-4xl lg:text-6xl font-light">
            {" "}
            {i18n.FORM.FORM_TITLE_HEAD_STRONG_SECOND}
          </span>
          <span className="block text-4xl lg:text-6xl font-light">
            {i18n.FORM.FORM_TITLE_HEAD_STRONG_THRID}
          </span>
        </h2>

        <p className="text-base leading-relaxed text-base-content/70 my-8">
          {i18n.FORM.FORM_SUBTITLE_SUBHEAD}
        </p>

        <ul className="space-y-2">
          <li className="flex items-center gap-4">
            <span className="text-3xl text-secondary ">
              {<Mail size={36} />}
            </span>
            <span>
              <strong className="text-sm text-base-content/50">
                {i18n.FORM.FORM_OPTIONS_CONTACT_EMAIL}
              </strong>{" "}
              <a
                href="mailto:erickm.gonzalez.rivera@gmail.com"
                target="_blank"
                aria-label="Correo electrónico"
                className="flex"
              >
                muke7881@gmail.com
              </a>
            </span>
          </li>
          <li className="flex items-center gap-4">
            <span className="text-3xl text-secondary">
              {<Phone size={36} />}
            </span>
            <span>
              <strong className="text-sm text-base-content/50">
                {i18n.FORM.FORM_OPTIONS_CONTACT_PHONE}
              </strong>{" "}
              <a
                href="https://wa.me/+527203966119"
                target="_blank"
                aria-label="Número de teléfono"
                className="flex"
              >
                +52-551-190 9105
              </a>
            </span>
          </li>
        </ul>
      </div>

      <div className="col-start-1 row-start-2 md:col-start-2 md:row-start-1 md:col-span-1 md:row-span-1 rounded-xl bg-base-300 p-5 lg:p-10 md:p-9 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} method="POST">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  {i18n.FORM.INPUT_NAME} <span className="text-red-500">*</span>
                </legend>
                <motion.input
                  type="text"
                  className="input w-full bg-base-200"
                  placeholder={i18n.FORM.INPUT_NAME}
                  whileFocus={{ scale: 1.02 }}
                  {...register("name")}
                />
                {errors.name && (
                  <motion.p
                    className="text-red-500"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {(errors.name as FieldError)?.message}
                  </motion.p>
                )}
              </fieldset>
            </div>
            <div>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  {i18n.FORM.INPUT_EMAIL}{" "}
                  <span className="text-red-500">*</span>
                </legend>
                <motion.input
                  type="email"
                  className="input w-full bg-base-200"
                  placeholder={i18n.FORM.INPUT_EMAIL}
                  whileFocus={{ scale: 1.02 }}
                  {...register("email")}
                />
                {errors.name && (
                  <motion.p
                    className="text-red-500"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {(errors.email as FieldError)?.message}
                  </motion.p>
                )}
              </fieldset>
            </div>
            <div>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  {i18n.FORM.INPUT_PHONE}{" "}
                  <span className="text-red-500">*</span>
                </legend>
                <motion.input
                  type="number"
                  className="input w-full bg-base-200"
                  placeholder={i18n.FORM.INPUT_PHONE}
                  whileFocus={{ scale: 1.02 }}
                  {...register("phone")}
                />
                {errors.phone && (
                  <motion.p
                    className="text-red-500"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {(errors.phone as FieldError)?.message}
                  </motion.p>
                )}
              </fieldset>
            </div>
            <div>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">
                  {i18n.FORM.INPUT_MORE_INFORMATION}
                </legend>
                <motion.textarea
                  className="textarea h-16 w-full bg-base-200"
                  placeholder={i18n.FORM.INPUT_MORE_INFORMATION_TEXT}
                  whileFocus={{ scale: 1.02 }}
                  {...register("moreInformation")}
                ></motion.textarea>
                {errors.moreInformation && (
                  <motion.p
                    className="text-red-500"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {(errors.moreInformation as FieldError)?.message}
                  </motion.p>
                )}
              </fieldset>
            </div>
            <motion.button
              type="submit"
              className="btn bg-gradient-to-r from-primary to-accent text-base-200 btn-wide max-w-full mt-2"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send className="w-5 h-5" />
              {i18n.FORM.BUTTON_LABEL}
            </motion.button>
          </div>

          <Toaster
            toastOptions={{
              style: {
                background: `${changeTheme === "night" ? "#0f172a" : changeTheme === "nord" ? "#2e3440" : "#eceff4"}`,
                color: `${changeTheme === "night" ? "#eceff4" : changeTheme === "nord" ? "#eceff4" : "#0f172a"}`,
              },
            }}
            reverseOrder={false}
          />
        </form>
      </div>
    </div>
  );
};
