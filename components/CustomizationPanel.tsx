// components/CustomizationPanel.tsx
'use client';

import React, { useState } from 'react';
import ColorPalette from './ColorPalette';
import FontSelector from './FontSelector';
import SectionReorder from './SectionReorder';

type Props = {
  headColor: string;
  setHeadColor: (c: string) => void;
  fontFamily: string;
  setFontFamily: (f: string) => void;
  fontSize: string;
  setFontSize: (f: string) => void;
  lineHeight: string;
  setLineHeight: (h: string) => void;
  sectionSpacing: string;
  setSectionSpacing: (s: string) => void;
  sectionOrder: string[];
  setSectionOrder: (o: string[]) => void;
  sectionLabels: { [key: string]: string };
};

export default function CustomizationPanel(props: Props) {
  const [selectedTab, setSelectedTab] = useState('color');

  const tabOptions = [
    { key: 'color', label: '🎨 Color' },
    { key: 'font', label: '🅰️ Font' },
    { key: 'spacing', label: '📏 Spacing' },
    { key: 'order', label: '📋 Section Order' },
  ];

  return (
    <div className="bg-white p-4 rounded-xl shadow space-y-4">
      <h3 className="text-lg font-semibold text-center">🛠️ Customize</h3>

      <div className="flex justify-center gap-2 flex-wrap">
        {tabOptions.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedTab(tab.key)}
            className={`px-3 py-1 rounded font-medium transition border ${
              selectedTab === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {selectedTab === 'color' && (
          <div>
            <label className="block text-sm font-medium mb-1 text-center">
              Header Color
            </label>
            <ColorPalette color={props.headColor} setColor={props.setHeadColor} size="sm" />
          </div>
        )}

        {selectedTab === 'font' && (
          <div className="space-y-4">
            <FontSelector font={props.fontFamily} setFont={props.setFontFamily} />
            <div>
              <label className="block text-sm font-medium mb-1 text-center">Font Size</label>
              <input
                type="range"
                min="12"
                max="20"
                value={parseInt(props.fontSize)}
                onChange={(e) => props.setFontSize(`${e.target.value}px`)}
                className="w-full"
                title="Font Size"
                placeholder="Font Size"
              />
              <div className="text-center text-xs mt-1">{props.fontSize}</div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-center">Line Height</label>
              <input
                type="range"
                min="1"
                max="2"
                step="0.1"
                value={parseFloat(props.lineHeight)}
                onChange={(e) => props.setLineHeight(e.target.value)}
                className="w-full"
              />
              <div className="text-center text-xs mt-1">{props.lineHeight}</div>
            </div>
          </div>
        )}

        {selectedTab === 'spacing' && (
          <div>
            <label className="block text-sm font-medium mb-1 text-center">
              Section Spacing
            </label>
            <input
              type="range"
              min="8"
              max="40"
              value={parseInt(props.sectionSpacing)}
              onChange={(e) => props.setSectionSpacing(`${e.target.value}px`)}
              className="w-full"
              title="Section Spacing"
            />
            <div className="text-center text-xs mt-1">{props.sectionSpacing}</div>
          </div>
        )}

        {selectedTab === 'order' && (
          <SectionReorder
            sectionOrder={props.sectionOrder}
            setSectionOrder={props.setSectionOrder}
            sectionLabels={props.sectionLabels}
          />
        )}
      </div>
    </div>
  );
}
