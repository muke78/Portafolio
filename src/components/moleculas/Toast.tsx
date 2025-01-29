import { getI18N } from "@/i18n";

import { useEffect, useState } from "react";

interface ToastProps {
  currentLocale: string;
}

export const Toast: React.FC<ToastProps> = ({ currentLocale }) => {
  const [visible, setVisible] = useState<boolean>(false);

  const i18n = getI18N({ currentLocale });

  const handleVisibleAlert = () => {
    setVisible(false);
    localStorage.setItem("toastClosed", JSON.stringify(true));
  };

  useEffect(() => {
    const isToastClosed = JSON.parse(
      localStorage.getItem("toastClosed") || "false",
    );
    if (!isToastClosed) {
      setVisible(true);
    }
  }, []);

  return (
    <>
      {visible && (
        <>
          <div
            id="toast"
            className="fixed top-24 left-1/2 -translate-x-1/2 -translate-y-1/2 
                                    md:top-24 md:right-5 md:left-auto md:translate-x-0
                                    flex items-center w-full max-w-xs p-4 space-x-4 divide-x rtl:divide-x-reverse 
                                    rounded-lg shadow backdrop-blur-[100px] backdrop-saturate-[180%] text-base z-20"
            role="alert"
          >
            <div role="alert">
              <div className="flex">
                <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-orange-500 bg-orange-100 rounded-lg dark:bg-orange-700 dark:text-orange-200">
                  <svg
                    className="w-5 h-5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z" />
                  </svg>
                  <span className="sr-only">Warning icon</span>
                </div>

                <div className="ms-3 text-sm font-normal">
                  <span className="mb-2 text-lg font-semibold text-base-content">
                    {i18n.TOAST.TOAST_TITLE}
                  </span>
                  <div className="mb-2 text-sm font-normal pt-2">
                    {i18n.TOAST.TOAST_BODY}
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      className="btn btn-primary btn-sm text-base"
                      onClick={handleVisibleAlert}
                    >
                      {i18n.TOAST.TOAST_BUTTON}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            id="toast-top-right"
            className="fixed top-24 left-1/2 -translate-x-1/2 -translate-y-1/2 
                                    md:top-24 md:right-5 md:left-auto md:translate-x-0
                                    flex items-center w-full max-w-xs p-4 space-x-4 divide-x rtl:divide-x-reverse 
                                    rounded-lg shadow backdrop-blur-[100px] backdrop-saturate-[180%] text-base z-10"
            role="alert"
          >
            <div className="text-lg font-normal text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
              Top right positioning.
            </div>
          </div>
        </>
      )}
    </>
  );
};
