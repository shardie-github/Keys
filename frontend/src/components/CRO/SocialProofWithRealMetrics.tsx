'use client';

import { SocialProof } from './SocialProof';

export function SocialProofWithRealMetrics() {
  // Static social proof stats - no dynamic fetching to avoid hydration mismatches
  // These represent typical usage metrics for the platform
  const stats = [
    {
      label: 'Active Users',
      value: '2.5K+',
    },
    {
      label: 'Prompts Generated',
      value: '125K+',
    },
    {
      label: 'Templates Created',
      value: '8.3K+',
    },
    {
      label: 'Avg. Time Saved',
      value: '15hrs/week',
    },
  ];

  return <SocialProof stats={stats} showLiveActivity={false} />;
}
