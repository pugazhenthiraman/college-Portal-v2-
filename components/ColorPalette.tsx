import React from 'react';
import { HexColorPicker } from 'react-colorful';

const presetColors = [
  '#2563eb', '#16a34a', '#f59e42', '#dc2626',
  '#a21caf', '#0e7490', '#fbbf24', '#64748b',
];

type Props = {
  color: string;
  setColor: (color: string) => void;
  size?: 'sm' | 'md';
};

export default function ColorPalette({ color, setColor, size = 'md' }: Props) {
  const swatchSize = size === 'sm' ? 'w-6 h-6' : 'w-10 h-10';

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap justify-center gap-2">
        {presetColors.map((c) => (
          <button
            key={c}
            className={`rounded-full border-2 ${swatchSize} transition-all duration-150 ease-in-out ${
              color === c ? 'border-black scale-110' : 'border-gray-300 hover:scale-105'
            }`}
            style={{ backgroundColor: c }}
            onClick={() => setColor(c)}
            aria-label={`Pick color ${c}`}
          />
        ))}
      </div>
      <HexColorPicker color={color} onChange={setColor} />
    </div>
  );
}
