import type React from "react";

interface PropsIconModal {
  onClick: () => void;
}

export const IconModal: React.FC<PropsIconModal> = ({ onClick }) => {
  return (
    <>
      <button
        className="btn btn-circle border border-neutral-700 btn-md absolute right-0 top-9 sm:right-0 top-1"
        type="button"
        onClick={onClick}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 512 512"
          className="fill-current"
        >
          <path
            fill="none"
            stroke="currentColor"
            strokeLinecap="square"
            strokeMiterlimit="10"
            strokeWidth="32"
            d="M432 320v112H320m101.8-10.23L304 304M80 192V80h112M90.2 90.23L208 208M320 80h112v112M421.77 90.2L304 208M192 432H80V320m10.23 101.8L208 304"
          />
        </svg>
      </button>
    </>
  );
};
