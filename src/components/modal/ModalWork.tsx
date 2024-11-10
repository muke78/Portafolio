export const ModalWork = () => {

  const handleOpenModal = () => {
    const modal = document.getElementById("my_modal_3") as HTMLDialogElement;
    modal.show();
  };

  return (
    <>
      {/* You can open the modal using document.getElementById('ID').showModal() method */}
      <button
        className="btn btn-outline btn-primary stat-value text-base-content bg-base-300"
        onClick={() => {
          handleOpenModal();
        }}
      >
        +4
      </button>
      <dialog id="my_modal_3" className="modal">
        <div className="modal-box">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg">Hello!</h3>
          <p className="py-4">Press ESC key or click on ✕ button to close</p>
        </div>
      </dialog>
    </>
  );
};
