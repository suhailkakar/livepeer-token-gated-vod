import React from "react";

interface InputProps {
  placeholder: string;
  textarea?: boolean;
  className?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  disabled?: boolean;
  value?: string;
  readOnly?: boolean;
}

export default function Input({
  placeholder,
  textarea,
  onChange,
  className,
  disabled,
  value,
  readOnly = false,
}: InputProps) {
  return (
    <div>
      {textarea ? (
        <textarea
          className={
            "bg-transparent p-4  border-zinc-800 border rounded-md text-zinc-400 text-sm font-light w-full h-32 placeholder:text-zinc-700 focus:outline-none "
          }
          placeholder={placeholder}
          disabled
          onChange={onChange}
          readOnly={readOnly}
          value={value}
        />
      ) : (
        <input
          className={
            className +
            " bg-transparent p-4  border-zinc-800 border rounded-md text-zinc-400 text-sm font-light w-full  placeholder:text-zinc-700 focus:outline-none"
          }
          placeholder={placeholder}
          onChange={onChange}
          value={value}
        />
      )}
    </div>
  );
}
