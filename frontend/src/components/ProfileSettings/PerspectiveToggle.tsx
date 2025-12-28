'use client';

import React from 'react';

interface PerspectiveToggleProps {
  value?: string;
  onChange: (value: string) => void;
}

const PERSPECTIVES = [
  { id: 'operator', label: 'Operator' },
  { id: 'investor', label: 'Investor' },
  { id: 'cfo', label: 'CFO' },
  { id: 'strategic', label: 'Strategic' },
];

export function PerspectiveToggle({ value, onChange }: PerspectiveToggleProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {PERSPECTIVES.map((perspective) => (
        <button
          key={perspective.id}
          onClick={() => onChange(perspective.id)}
          className={`p-4 text-left border-2 rounded-lg transition-colors ${
            value === perspective.id
              ? 'border-primary-600 bg-primary-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <span className="font-medium">{perspective.label}</span>
        </button>
      ))}
    </div>
  );
}
