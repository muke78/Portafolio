import { getI18N } from "@/i18n";
import type { PropsLang } from "@/interfaces/currentLang.interface";

export const SobreMi = ({ currentLocale }: PropsLang) => {
  const i18n = getI18N({ currentLocale });

  return (
    <>
      <span className="font-bold text-5xl"> {i18n.ABOUTME.ABOUT_TITLE}</span>
      <div className="grid grid-cols-1 w-full bg-base-100 rounded-lg mt-4 shadow-lg animate__animated animate__zoomIn">
        <img
          className="rounded-t-lg bg-cover bg-no-repeat w-full"
          src="/Aboutme.webp"
          alt="Acerca de mí"
        />
        <div className="p-5">
          <div className="flex justify-between">
            <span className="text-2xl">{i18n.ABOUTME.ABOUT_TITLE_CARD}</span>
          </div>
          <p className="badge badge-primary text-base-200 text-base font-medium my-2">
            {" "}
            {i18n.ABOUTME.ABOUT_SUBTITLE}
          </p>
          <div>
            <p className="font-normal text-base/8">
              {i18n.ABOUTME.ABOUT_ABOUT_DESCRIPTION}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
