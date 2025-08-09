import { getI18N } from "@/i18n";
import type { PropsLang } from "@/interfaces/currentLang.interface";

export const Educacion = ({ currentLocale }: PropsLang) => {
  const i18n = getI18N({ currentLocale });
  return (
    <>
      <span className="font-bold text-5xl">
        {i18n.EDUCATION.EDUCATION_TITLE}
      </span>
      <div className="grid grid-cols-1 w-full bg-base-100 rounded-lg mt-4 shadow-lg animate__animated animate__zoomIn">
        <img className="rounded-t-lg w-full" src="/UPVM.webp" alt="" />
        <div className="p-5">
          <div className="flex justify-between">
            <span className="text-2xl">{i18n.UNIVERSITY.UNIVERSITY_TITLE}</span>
            <p className="flex place-items-center text-right text-base-200 text-nowrap font-medium badge badge-primary">
              2019 - 2022
            </p>
          </div>
          <p className="text-lg font-medium text-primary">
            {" "}
            {i18n.UNIVERSITY.UNIVERSITY_SUBTITLE}
          </p>
          <div className="pt-4">
            <p className="font-normal text-base/8">
              {i18n.UNIVERSITY.UNIVERSITY_TEXT}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
