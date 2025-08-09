import { v } from "@/styles/variables";

interface PropsIconModal {
  onClick: () => void;
}

export const IconModal = ({ onClick }: PropsIconModal) => {
  return (
    <>
      <button
        className="btn btn-circle border border-neutral-700 btn-md absolute right-0 sm:right-0 top-1"
        aria-label="expand"
        type="button"
        onClick={onClick}
      >
        <span className="text-2xl">
          {v.iconoModalExpand && <v.iconoModalExpand />}
        </span>
      </button>
    </>
  );
};
