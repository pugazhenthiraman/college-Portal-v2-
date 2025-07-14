// components/ui/TestInput.tsx
"use client";

import React from "react";

interface TestInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  rightIcon?: React.ReactNode;
}

export function TestInput({ label, className = "", rightIcon, ...props }: TestInputProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
      <input
        {...props}
        className={`
          w-full px-3 py-2 border border-gray-300 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-indigo-400
          transition-shadow duration-200 ease-in-out
          hover:shadow-md ${className}
            ${rightIcon ? 'pr-10' : ''}
        `}
      />
        {rightIcon && (
          <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            {rightIcon}
          </span>
        )}
      </div>
    </div>
  );
}
