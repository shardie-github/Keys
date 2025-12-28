'use client';

import React from 'react';

interface StackSelectorProps {
  stack: Record<string, boolean>;
  onChange: (stack: Record<string, boolean>) => void;
}

const STACK_OPTIONS = [
  { id: 'shopify', label: 'Shopify' },
  { id: 'supabase', label: 'Supabase' },
  { id: 'mindstudio', label: 'MindStudio' },
  { id: 'capcut', label: 'CapCut' },
  { id: 'stripe', label: 'Stripe' },
  { id: 'zapier', label: 'Zapier / Make / n8n' },
];

export function StackSelector({ stack, onChange }: StackSelectorProps) {
  const toggleStack = (id: string) => {
    onChange({
      ...stack,
      [id]: !stack[id],
    });
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {STACK_OPTIONS.map((option) => (
        <button
          key={option.id}
          onClick={() => toggleStack(option.id)}
          className={`p-4 text-left border-2 rounded-lg transition-colors ${
            stack[option.id]
              ? 'border-primary-600 bg-primary-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <span className="font-medium">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
