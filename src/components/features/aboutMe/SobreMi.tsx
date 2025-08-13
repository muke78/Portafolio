import { getI18N } from "@/i18n";
import type { PropsLang } from "@/interfaces/currentLang.interface";

export const SobreMi = ({ currentLocale }: PropsLang) => {
  const i18n = getI18N({ currentLocale });

  return (
    <div className="w-full flex flex-col hero-content">
      <span className="font-bold text-5xl"> {i18n.ABOUTME.ABOUT_TITLE}</span>
      <div className="grid grid-cols-1 w-full card bg-base-100 shadow-md border border-transparent hover:bg-gradient-to-tr from-secondary/30 via-secondary/5 to-transparent hover:shadow-2xl hover:scale-[1.03] hover:brightness-105 transition-all duration-400 ease-in-out mt-4 animate__animated animate__zoomIn">
        <img
          className="rounded-t-lg"
          src="/Aboutme.webp"
          alt="Acerca de mí"
          style={{
            width: "1918px",
            height: "400px",
            objectFit: "cover",
          }}
        />
        <div className="p-5">
          <div className="flex justify-between">
            <span className="text-2xl">{i18n.ABOUTME.ABOUT_TITLE_CARD}</span>
          </div>
          <p className="badge badge-secondary text-base-200 text-base font-medium my-2">
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
    </div>
  );
};
