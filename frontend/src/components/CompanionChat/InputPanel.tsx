'use client';

import React, { useState } from 'react';
import { SliderControl } from './SliderControl';
import type { VibeConfig } from '@/types';

interface InputPanelProps {
  onSend: (message: string, vibeConfig: Partial<VibeConfig>) => void;
  initialVibeConfig?: Partial<VibeConfig>;
  loading?: boolean;
}

export function InputPanel({
  onSend,
  initialVibeConfig,
  loading = false,
}: InputPanelProps) {
  const [message, setMessage] = useState('');
  const [playfulness, setPlayfulness] = useState(
    initialVibeConfig?.playfulness ?? 50
  );
  const [revenueFocus, setRevenueFocus] = useState(
    initialVibeConfig?.revenue_focus ?? 60
  );
  const [investorPerspective, setInvestorPerspective] = useState(
    initialVibeConfig?.investor_perspective ?? 40
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    onSend(message, {
      playfulness,
      revenue_focus: revenueFocus,
      investor_perspective: investorPerspective,
    });

    setMessage('');
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {/* Slider Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <SliderControl
          label="Playfulness"
          value={playfulness}
          onChange={setPlayfulness}
          description="0 = Serious, 100 = Playful"
        />
        <SliderControl
          label="Business Outcome Focus"
          value={revenueFocus}
          onChange={setRevenueFocus}
          description="0 = Exploratory, 100 = ROI-obsessed"
        />
        <SliderControl
          label="Investor Perspective"
          value={investorPerspective}
          onChange={setInvestorPerspective}
          description="0 = Pure operator/tech, 100 = Investor/CFO framing"
        />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your request... (e.g., 'Draft an RFC for adding SSO', 'Design architecture for telemetry pipeline', 'Create test plan for critical module')"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!message.trim() || loading}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
