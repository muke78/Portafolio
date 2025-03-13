import { getI18N } from "@/i18n";

import React from "react";

interface PropsLang {
  currentLocale: string;
}
export const Form: React.FC<PropsLang> = ({ currentLocale }) => {
  const i18n = getI18N({ currentLocale });
  return (
    <div className="flex flex-col gap-4 bg-base-200 p-8 rounded-lg">
      <span className="font-bold text-5xl">{i18n.FORM.FORM_TITLE}</span>
      <p className="w-5/6 text-md">{i18n.FORM.FORM_DESCRIPTION}</p>
      <form action="">
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
                required
              />
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
                required
              />
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
                required
              />
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
                required
              />
            </fieldset>
          </div>
          <div className="col-span-2">
            <fieldset className="fieldset ">
              <label>{i18n.FORM.INPUT_SERVICES}</label>
              <select
                defaultValue="Pick a browser"
                className="select w-full"
                required
              >
                <option disabled={true}>{i18n.FORM.INPUT_SERVICES}</option>
                <option>{i18n.FORM.DEVELOPMENT_WEB}</option>
                <option>{i18n.FORM.DEVELOPMENT_API}</option>
                <option>{i18n.FORM.CONSULT}</option>
              </select>
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
                required
              ></textarea>
            </fieldset>
          </div>
        </div>
        <button className="btn btn-primary ">{i18n.FORM.BUTTON_LABEL}</button>
      </form>
    </div>
  );
};
