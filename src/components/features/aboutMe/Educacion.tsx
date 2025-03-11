import { getI18N } from "@/i18n";

import React from "react";

export const Educacion = ({ currentLocale }) => {
  const i18n = getI18N({ currentLocale });
  return (
    <>
      <div className="grid grid-cols-1 w-full bg-base-100 rounded-lg shadow-sm">
        <img className="rounded-t-lg w-full" src="/UPVM.jpg" alt="" />
        <div className="p-5">
          <div className="flex justify-between">
            <span className="text-2xl">{i18n.UNIVERSITY.UNIVERSITY_TITLE}</span>
            <p className="flex place-items-center text-right text-nowrap font-medium text-gray-600">
              2019 - 2022
            </p>
          </div>
          <p className="text-lg font-medium text-gray-600">
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
