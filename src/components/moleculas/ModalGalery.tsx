import React, { useEffect, useRef } from "react";

interface PropsDataModal {
  data: any;
  isModalOpen: boolean;
  closeModal: () => void;
}

export const ModalGalery: React.FC<PropsDataModal> = ({
  data,
  isModalOpen,
  closeModal,
}) => {
  const modalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (modalRef.current) {
      if (isModalOpen) {
        modalRef.current.showModal();
      } else {
        modalRef.current.close();
      }
    }
  }, [isModalOpen]);

  return (
    <>
      {/* Modal */}
      <dialog
        ref={modalRef}
        id="modalExperience"
        className="modal z-50 fixed inset-0 flex items-center justify-center"
      >
        {/* Filtro tipo vidrio */}
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm z-40"></div>

        <div className="modal-box max-w-screen-2xl backdrop-blur-[30px] backdrop-saturate-[180%] rounded-b-lg p-0 bg-transparent bg-opacity-40 border border-neutral-700 z-50">
          {/* Modal header */}
          <div className="w-full flex sticky bg-accent top-0 items-center justify-between bg-current z-10 p-4 md:p-5 border-b rounded-t">
            <h3 className="text-2xl font-semibold text-base-100">Galería</h3>
            <form method="dialog">
              <button
                onClick={closeModal}
                className="btn btn-sm btn-circle rounded-lg text-sm ms-auto inline-flex justify-center items-center"
              >
                <svg
                  className="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span className="sr-only">Cerrar modal</span>
              </button>
            </form>
          </div>
          {/* Modal body */}
          <div className="p-4 md:p-5 overflow-y-auto max-h-full">
            <img src={data.img} alt={data.title} />
          </div>
        </div>
      </dialog>
    </>
  );
};
