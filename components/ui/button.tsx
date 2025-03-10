"use client";

import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "destructive" | "outline" | "ghost";
};

export function Button({ children, className, variant = "primary", ...props }: ButtonProps) {
  let baseStyle = "px-4 py-2 rounded-md text-white font-medium transition";

  switch (variant) {
    case "primary":
      baseStyle += " bg-blue-600 hover:bg-blue-700";
      break;
    case "destructive":
      baseStyle += " bg-red-600 hover:bg-red-700";
      break;
    case "outline":
      baseStyle += " border border-gray-500 text-gray-700 hover:bg-gray-200";
      break;
    case "ghost":
      baseStyle += " text-gray-700 hover:bg-gray-100";
      break;
  }

  return (
    <button className={`${baseStyle} ${className}`} {...props}>
      {children}
    </button>
  );
}
