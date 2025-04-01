import { useTheme } from "@/hooks/useTheme";
import { getI18N } from "@/i18n";

import React, { useEffect, useState } from "react";
import { type FieldError, useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";

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

  const i18n = getI18N({ currentLocale });
  const inputErrorText = `${i18n.FORM.FORM_VALID_INFORMATION}`;
  const invalidPatterEmail = `${i18n.FORM.FORM_INVALID_EMAIL}`;
  const sendInformationValid = `${i18n.FORM.FORM_SEND_INFORMATION_CORRECT}`;
  const errorSendInformation = `${i18n.FORM.FORM_SEND_INFORMATION_INCORRECT}`;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

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
    <div className="flex flex-col gap-4 bg-base-200 p-8 mt-16 rounded-lg">
      <div className="flex justify-between items-center w-full">
        <span className="font-bold text-5xl">{i18n.FORM.FORM_TITLE}</span>
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="56"
            height="56"
            viewBox="0 0 256 256"
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
      <p className="w-5/6 text-md">{i18n.FORM.FORM_DESCRIPTION}</p>
      <form onSubmit={handleSubmit(onSubmit)} method="POST">
        <div className="grid grid-cols-2 grid-rows-5 gap-4">
          <div>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">
                {i18n.FORM.INPUT_NAME}
              </legend>
              <input
                type="text"
                className="input w-full"
                placeholder={i18n.FORM.INPUT_NAME}
                {...register("name", { required: inputErrorText })}
              />
              {errors.name && (
                <p className="text-red-500">
                  {(errors.name as FieldError)?.message}
                </p>
              )}
            </fieldset>
          </div>
          <div>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">
                {i18n.FORM.INPUT_LAST_NAME}
              </legend>
              <input
                type="text"
                className="input w-full"
                placeholder={i18n.FORM.INPUT_LAST_NAME}
                {...register("lastName", {
                  required: inputErrorText,
                })}
              />
              {errors.name && (
                <p className="text-red-500">
                  {(errors.lastName as FieldError)?.message}
                </p>
              )}
            </fieldset>
          </div>
          <div className="row-start-2">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">
                {i18n.FORM.INPUT_EMAIL}
              </legend>
              <input
                type="email"
                className="input w-full"
                placeholder={i18n.FORM.INPUT_EMAIL}
                {...register("email", {
                  required: inputErrorText,
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: invalidPatterEmail,
                  },
                })}
              />
              {errors.name && (
                <p className="text-red-500">
                  {(errors.email as FieldError)?.message}
                </p>
              )}
            </fieldset>
          </div>
          <div className="row-start-2">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">
                {i18n.FORM.INPUT_PHONE}
              </legend>
              <input
                type="number"
                className="input w-full"
                placeholder={i18n.FORM.INPUT_PHONE}
                {...register("phone", {
                  required: inputErrorText,
                })}
              />
              {errors.phone && (
                <p className="text-red-500">
                  {(errors.phone as FieldError)?.message}
                </p>
              )}
            </fieldset>
          </div>
          <div className="col-span-2">
            <fieldset className="fieldset ">
              <label>{i18n.FORM.INPUT_SERVICES}</label>
              <select
                defaultValue="Pick a browser"
                className="select w-full"
                {...register("services", {
                  required: inputErrorText,
                })}
              >
                <option disabled={true}>{i18n.FORM.INPUT_SERVICES}</option>
                <option>{i18n.FORM.DEVELOPMENT_WEB}</option>
                <option>{i18n.FORM.DEVELOPMENT_API}</option>
                <option>{i18n.FORM.CONSULT}</option>
              </select>
              {errors.services && (
                <p className="text-red-500">
                  {(errors.services as FieldError)?.message}
                </p>
              )}
            </fieldset>
          </div>
          <div className="col-span-2 row-span-2 row-start-4">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">
                {i18n.FORM.INPUT_MORE_INFORMATION}
              </legend>
              <textarea
                className="textarea h-24 w-full"
                placeholder={i18n.FORM.INPUT_MORE_INFORMATION_TEXT}
                {...register("moreInformation", {
                  required: inputErrorText,
                })}
              ></textarea>
              {errors.moreInformation && (
                <p className="text-red-500">
                  {(errors.moreInformation as FieldError)?.message}
                </p>
              )}
            </fieldset>
          </div>
        </div>
        <button className="btn btn-primary">{i18n.FORM.BUTTON_LABEL}</button>
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
