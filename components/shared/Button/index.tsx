import React from "react";

export default function Button({
  children,
  disable,
  onClick,
  className,
  secondary,
}: {
  children: React.ReactNode;
  disable?: boolean;
  onClick?: () => void;
  className?: string;
  secondary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={
        secondary
          ? "  rounded-xl  text-sm font-medium p-3 mt-6 w-36 hover:cursor-pointer bg-[#222] text-gray-300 ml-4 mr-4  " +
            (disable ? " opacity-50 cursor-not-allowed" : "")
          : "  rounded-xl  text-sm font-medium p-3 mt-6  w-36 hover:cursor-pointer bg-primary " +
            (disable ? " opacity-50 cursor-not-allowed" : "")
      }
    >
      {children}
    </button>
  );
}
