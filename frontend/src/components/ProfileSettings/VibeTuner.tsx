'use client';

import React from 'react';
import { SliderControl } from '../CompanionChat/SliderControl';

interface VibeTunerProps {
  playfulness: number;
  revenueFocus: number;
  investorPerspective: number;
  onChange: (vibe: {
    playfulness: number;
    revenueFocus: number;
    investorPerspective: number;
  }) => void;
}

export function VibeTuner({
  playfulness,
  revenueFocus,
  investorPerspective,
  onChange,
}: VibeTunerProps) {
  const updateVibe = (key: string, value: number) => {
    onChange({
      playfulness,
      revenueFocus,
      investorPerspective,
      [key]: value,
    });
  };

  return (
    <div className="space-y-6">
      <SliderControl
        label="Playfulness"
        value={playfulness}
        onChange={(value) => updateVibe('playfulness', value)}
        description="0 = Serious, 100 = Playful"
      />
      <SliderControl
        label="Revenue Focus"
        value={revenueFocus}
        onChange={(value) => updateVibe('revenueFocus', value)}
        description="0 = Impact, 100 = Revenue"
      />
      <SliderControl
        label="Investor Perspective"
        value={investorPerspective}
        onChange={(value) => updateVibe('investorPerspective', value)}
        description="0 = Operator, 100 = CFO"
      />
    </div>
  );
}
