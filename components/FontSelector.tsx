import React from 'react';

const fonts = [
  { label: 'Sans-serif', value: 'sans-serif' },
  { label: 'Serif', value: 'serif' },
  { label: 'Monospace', value: 'monospace' },
  { label: 'Roboto', value: "'Roboto', sans-serif" },
  { label: 'Open Sans', value: "'Open Sans', sans-serif" },
  { label: 'Lato', value: "'Lato', sans-serif" },
  { label: 'Montserrat', value: "'Montserrat', sans-serif" },
  { label: 'Poppins', value: "'Poppins', sans-serif" },
  { label: 'Raleway', value: "'Raleway', sans-serif" },
  { label: 'Merriweather', value: "'Merriweather', serif" },
  { label: 'Playfair Display', value: "'Playfair Display', serif" },
];

export default function FontSelector({
  font,
  setFont,
}: {
  font: string;
  setFont: (f: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-center">Font Style</label>
      <div className="flex flex-wrap justify-center gap-2">
        {fonts.map((f) => (
          <button
            key={f.value}
            className={`px-3 py-1 rounded border transition ${
              font === f.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            onClick={() => setFont(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
