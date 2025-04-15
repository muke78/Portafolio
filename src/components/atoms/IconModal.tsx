import { v } from "@/styles/variables";

import type React from "react";

interface PropsIconModal {
  onClick: () => void;
}

export const IconModal: React.FC<PropsIconModal> = ({ onClick }) => {
  return (
    <>
      <button
        className="btn btn-circle border border-neutral-700 btn-md absolute right-0 top-0 sm:right-0 top-1"
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
