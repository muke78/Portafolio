import { useTheme } from "@/hooks/useTheme";
import { getI18N } from "@/i18n";
import { contactSchema } from "@/schemas/contactSchema";
import { v } from "@/styles/variables";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";

import { zodResolver } from "@hookform/resolvers/zod";
import { VITE_BOT_TOKEN, VITE_CHAT_ID } from "astro:env/client";

interface PropsLang {
  currentLocale: string;
}

interface FormData {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  services: string;
  moreInformation: string;
}

export const Form: React.FC<PropsLang> = ({ currentLocale }) => {
  const { changeTheme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStep, setFormStep] = useState(0);
  const totalSteps = 2;

  const i18n = getI18N({ currentLocale });
  const sendInformationValid = `${i18n.FORM.FORM_SEND_INFORMATION_CORRECT}`;
  const errorSendInformation = `${i18n.FORM.FORM_SEND_INFORMATION_INCORRECT}`;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setFocus,
  } = useForm<FormData>({
    resolver: zodResolver(contactSchema({ currentLocale })),
    defaultValues: {
      name: "",
      lastName: "",
      email: "",
      phone: "",
      services: i18n.FORM.DEVELOPMENT_WEB,
      moreInformation: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    const botToken = VITE_BOT_TOKEN;
    const chatId = VITE_CHAT_ID;
    setIsSubmitting(true);

    if (!botToken || !chatId) {
      toast.error("No se encontraron credenciales de Telegram.", {
        duration: 5000,
        position: "bottom-right",
      });
      return;
    }

    const message = `📩 *Nuevo formulario enviado*\n
  🔹 *Nombre:* ${data.name}
  🔹 *Apellido:* ${data.lastName}
  🔹 *Email:* ${data.email}
  🔹 *Teléfono:* ${data.phone}
  🔹 *Servicio:* ${data.services}
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
      setIsSubmitting(false);
      reset();
    } catch (error) {
      toast.error(`${errorSendInformation}, ${error}`, {
        duration: 5000,
        position: "bottom-right",
      });
      console.error("Error:", error);
    }
  };

  const resetForm = () => {
    setFormStep(0);
    reset();
    // Would reset form state here
  };

  const nextStep = () => {
    if (formStep < totalSteps) {
      setFormStep(formStep + 1);
    }
  };

  const prevStep = () => {
    if (formStep > 0) {
      setFormStep(formStep - 1);
    }
  };

  useEffect(() => {
    // Pequeño timeout para asegurarnos que el DOM está listo
    setTimeout(() => {
      setFocus("name");
    }, 100);
  }, [setFocus]);

  return (
    <div className="bg-base-200/40 p-8 mt-8 rounded-lg shadow-lg max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center w-full mb-6">
        <div>
          <h1 className="font-bold text-3xl lg:text-5xl text-primary">
            {i18n.FORM.FORM_TITLE}
          </h1>
          <p className="mt-2 text-md opacity-80">
            {i18n.FORM.FORM_DESCRIPTION}
          </p>
        </div>
        <div className="flex-shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="42"
            height="42"
            viewBox="0 0 256 256"
            className="opacity-90"
          >
            <defs>
              <linearGradient
                id="logosTelegram0"
                x1="50%"
                x2="50%"
                y1="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#2aabee" />
                <stop offset="100%" stopColor="#229ed9" />
              </linearGradient>
            </defs>
            <path
              fill="url(#logosTelegram0)"
              d="M128 0C94.06 0 61.48 13.494 37.5 37.49A128.04 128.04 0 0 0 0 128c0 33.934 13.5 66.514 37.5 90.51C61.48 242.506 94.06 256 128 256s66.52-13.494 90.5-37.49c24-23.996 37.5-56.576 37.5-90.51s-13.5-66.514-37.5-90.51C194.52 13.494 161.94 0 128 0"
            />
            <path
              fill="#fff"
              d="M57.94 126.648q55.98-24.384 74.64-32.152c35.56-14.786 42.94-17.354 47.76-17.441c1.06-.017 3.42.245 4.96 1.49c1.28 1.05 1.64 2.47 1.82 3.467c.16.996.38 3.266.2 5.038c-1.92 20.24-10.26 69.356-14.5 92.026c-1.78 9.592-5.32 12.808-8.74 13.122c-7.44.684-13.08-4.912-20.28-9.63c-11.26-7.386-17.62-11.982-28.56-19.188c-12.64-8.328-4.44-12.906 2.76-20.386c1.88-1.958 34.64-31.748 35.26-34.45c.08-.338.16-1.598-.6-2.262c-.74-.666-1.84-.438-2.64-.258c-1.14.256-19.12 12.152-54 35.686c-5.1 3.508-9.72 5.218-13.88 5.128c-4.56-.098-13.36-2.584-19.9-4.708c-8-2.606-14.38-3.984-13.82-8.41c.28-2.304 3.46-4.662 9.52-7.072"
            />
          </svg>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress mb-6">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${(formStep / totalSteps) * 100}%` }}
        ></div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} method="POST">
        {/* Step 1: Personal Information */}
        {formStep === 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <div className="mr-2">
                {v.iconoAcercaDeMi && <v.iconoAcercaDeMi />}
              </div>
              Personal Information
            </h2>

            {/* Name fields in a responsive grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">{i18n.FORM.INPUT_NAME}</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    aria-label={i18n.FORM.INPUT_NAME}
                    className={`input input-bordered w-full pl-10 text-base-content rounded-l-lg ${errors.name ? "input-error" : ""}`}
                    placeholder={i18n.FORM.INPUT_NAME}
                    {...register("name")}
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-opacity-60">
                    {v.iconoAcercaDeMi && <v.iconoAcercaDeMi />}
                  </div>
                  {errors.name && (
                    <span className="text-error text-sm">
                      {errors.name.message?.toString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">
                    {i18n.FORM.INPUT_LAST_NAME}
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    aria-label={i18n.FORM.INPUT_LAST_NAME}
                    className={`input input-bordered w-full pl-10 text-base-content rounded-l-lg ${errors.lastName ? "input-error" : ""}`}
                    placeholder={i18n.FORM.INPUT_LAST_NAME}
                    {...register("lastName")}
                  />

                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-opacity-60">
                    {v.iconoAcercaDeMi && <v.iconoAcercaDeMi />}
                  </div>
                  {errors.lastName && (
                    <span className="text-error text-sm">
                      {errors.lastName.message?.toString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Contact information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">{i18n.FORM.INPUT_EMAIL}</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    aria-label={i18n.FORM.INPUT_EMAIL}
                    className={`input input-bordered w-full pl-10 text-base-content rounded-l-lg ${errors.email ? "input-error" : ""}`}
                    placeholder="example@email.com"
                    {...register("email")}
                  />

                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-opacity-60">
                    {v.iconoCorreo && <v.iconoCorreo />}
                  </div>
                  {errors.email && (
                    <span className="text-error text-sm">
                      {errors.email.message?.toString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">{i18n.FORM.INPUT_PHONE}</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    aria-label={i18n.FORM.INPUT_PHONE}
                    className={`input input-bordered w-full pl-10 text-base-content rounded-l-lg ${errors.phone ? "input-error" : ""}`}
                    placeholder="+1 (555) 123-4567"
                    {...register("phone")}
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-opacity-60">
                    {v.iconoTelefono && <v.iconoTelefono />}
                  </div>
                  {errors.phone && (
                    <span className="text-error text-sm">
                      {errors.phone.message?.toString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Service Details */}
        {formStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <div className="mr-2">{v.iconoMaletin && <v.iconoMaletin />}</div>
              Service Details
            </h2>

            {/* Service selection */}
            <div className="form-control">
              <label className="label" htmlFor="services">
                <span className="label-text">{i18n.FORM.INPUT_SERVICES}</span>
              </label>
              <div className="relative">
                <select
                  id="services"
                  className={`select w-full pl-10 ${errors.services ? "select-error" : ""}`}
                  {...register("services")}
                >
                  <option value="" disabled selected>
                    Select a service
                  </option>
                  <option>{i18n.FORM.DEVELOPMENT_WEB}</option>
                  <option>{i18n.FORM.DEVELOPMENT_API}</option>
                  <option>{i18n.FORM.CONSULT}</option>
                </select>

                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-opacity-60">
                  {v.iconoMaletin && <v.iconoMaletin />}
                </div>
                {errors.services && (
                  <span className="text-error text-sm">
                    {errors.services.message?.toString()}
                  </span>
                )}
              </div>
            </div>

            {/* Additional information */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  {i18n.FORM.INPUT_MORE_INFORMATION}
                </span>
              </label>
              <div className="relative">
                <textarea
                  className={`textarea h-32 w-full pl-10 pt-8 ${errors.moreInformation ? "textarea-error" : ""}`}
                  placeholder={i18n.FORM.INPUT_MORE_INFORMATION_TEXT}
                  aria-label={i18n.FORM.INPUT_MORE_INFORMATION}
                  {...register("moreInformation")}
                ></textarea>

                <div className="absolute left-3 top-8 text-opacity-60">
                  {v.iconoMensajeCubo && <v.iconoMensajeCubo />}
                </div>
                {errors.moreInformation && (
                  <span className="text-error text-sm">
                    {errors.moreInformation.message?.toString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {formStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Review & Submit</h2>
            <div className="bg-base-300/50 p-6 rounded-lg">
              <p className="text-sm opacity-80 mb-4">
                Please review your information before submitting.
              </p>
              {/* In a real implementation, we would show a summary of form data here */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Service:</span>
                  <span>{i18n.FORM.DEVELOPMENT_WEB}</span>
                </div>
                <div className="border-t border-base-300 my-2"></div>
                <p className="text-sm opacity-80">
                  By submitting this form, you agree to our terms and privacy
                  policy.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form Navigation */}
        <div className="flex justify-between mt-8">
          {formStep > 0 ? (
            <button
              type="button"
              className="btn btn-outline flex items-center gap-2"
              onClick={prevStep}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              {/* {i18n.FORM.BUTTON_PREV} */}
              Antes
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-ghost text-error"
              onClick={resetForm}
            >
              <div className="mr-1">{v.iconoCerrar && <v.iconoCerrar />}</div>
              {/* {i18n.FORM.RESET_FORM} */}
              Reset
            </button>
          )}

          {formStep < totalSteps ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={nextStep}
            >
              {/* {i18n.FORM.BUTTON_NEXT} */}
              Siguiente
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          ) : (
            <button
              type="submit"
              className={`btn btn-primary ${isSubmitting ? "loading" : ""}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : i18n.FORM.BUTTON_LABEL}

              {!isSubmitting && (
                <div className="ml-2">
                  {v.iconoBotonEnviar && <v.iconoBotonEnviar />}
                </div>
              )}
            </button>
          )}
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
  );
};
