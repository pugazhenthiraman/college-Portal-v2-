'use client';

import React, { useState, useEffect } from 'react';

type ColorOption = {
  name: string;
  headerBgColor: string;
  headerTextColor: string;
  headerTitleColor: string;
};

const colorOptions: ColorOption[] = [

  {
    name: 'Soft Green + Dark Gray',
    headerBgColor: '#e0f7e9',
    headerTextColor: '#2c3e50',
    headerTitleColor: '#2c3e50',
  },
  {
    name: 'Warm Yellow + Charcoal',
    headerBgColor: '#fff9c4',
    headerTextColor: '#424242',
    headerTitleColor: '#424242',
  },

  {
    name: 'Mint Green + Dark Teal',
    headerBgColor: '#b2f2bb',
    headerTextColor: '#004d40',
    headerTitleColor: '#004d40',
  },
  {
    name: 'Lavender + Deep Purple',
    headerBgColor: '#e6e6fa',
    headerTextColor: '#4b0082',
    headerTitleColor: '#4b0082',
  },
  {
    name: 'Peach + Brown',
    headerBgColor: '#ffe5b4',
    headerTextColor: '#5d4037',
    headerTitleColor: '#5d4037',
  },

  {
    name: 'Light Gray + Black',
    headerBgColor: '#cccccc',
    headerTextColor: '#000000',
    headerTitleColor: '#15157f',
  },

  {
    name: 'Pale Blue + Deep Charcoal',
    headerBgColor: '#cceaff',
    headerTextColor: '#1a1a1a',
    headerTitleColor: '#003366',
  },
  {
    name: 'Beige + Deep Brown',
    headerBgColor: '#f5e0c7',
    headerTextColor: '#3b2b1f',
    headerTitleColor: '#000000',
  },
  {
    name: 'Midnight Blue + White Text',
    headerBgColor: '#001f3f',
    headerTextColor: '#ffffff',
    headerTitleColor: '#ffffff',
  },
  {
    name: 'Slate + White Text',
    headerBgColor: '#2c3e50',
    headerTextColor: '#ecf0f1',
    headerTitleColor: '#ffffff',
  }
];

type Props = {
  setHeaderBgColor: (color: string) => void;
  setHeaderTextColor: (color: string) => void;
  setHeaderTitleColor: (color: string) => void;
  currentHeaderBgColor: string;
  currentHeaderTextColor: string;
  currentHeaderTitleColor: string;
};

export default function ColorPalette({
  setHeaderBgColor,
  setHeaderTextColor,
  setHeaderTitleColor,
  currentHeaderBgColor,
  currentHeaderTextColor,
  currentHeaderTitleColor,
}: Props) {
  const [brightness, setBrightness] = useState(1);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--resume-brightness', brightness.toString());
  }, [brightness]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {colorOptions.map((option, index) => {
          const isSelected =
            currentHeaderBgColor === option.headerBgColor &&
            currentHeaderTextColor === option.headerTextColor &&
            currentHeaderTitleColor === option.headerTitleColor;

          return (
            <button
              key={index}
              className={`flex items-center justify-between border rounded-md p-2 transition hover:scale-105 ${
                isSelected ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300'
              }`}
              style={{
                backgroundColor: option.headerBgColor,
                color: option.headerTextColor,
                fontWeight: isSelected ? 600 : 500,
                textShadow:
                  option.headerTextColor === '#ffffff' ? '0 1px 2px rgba(0,0,0,0.5)' : 'none',
              }}
              onClick={() => {
                setHeaderBgColor(option.headerBgColor);
                setHeaderTextColor(option.headerTextColor);
                setHeaderTitleColor(option.headerTitleColor);
              }}
            >
              <span className="text-sm font-medium truncate w-4/5">{option.name}</span>
              {isSelected && <span className="ml-2 text-xs">✅</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}