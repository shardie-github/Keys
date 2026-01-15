'use client';

import { useEffect, useState } from 'react';
import { SocialProof } from './SocialProof';

interface SystemMetrics {
  totalUsers: number;
  totalPrompts: number;
  totalTemplates: number;
}

export function SocialProofWithRealMetrics() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);

  useEffect(() => {
    // Fetch system metrics through frontend API proxy
    const fetchMetrics = async () => {
      try {
        // Use frontend API proxy instead of calling backend directly
        const response = await fetch('/api/metrics');

        if (response.ok) {
          const data = await response.json();
          setMetrics({
            totalUsers: data.users?.total || 0,
            totalPrompts: data.usage?.totalPrompts || 0,
            totalTemplates: data.usage?.totalTemplates || 0,
          });
        } else {
          // If API fails, use defaults (metrics will show "—")
          setMetrics(null);
        }
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
        // Fallback to showing nothing or cached values
        setMetrics(null);
      }
    };

    fetchMetrics();
  }, []);

  // Format numbers for display
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M+`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K+`;
    return num.toString();
  };

  const stats = metrics
    ? [
        {
          label: 'Active Users',
          value: formatNumber(metrics.totalUsers),
        },
        {
          label: 'Prompts Generated',
          value: formatNumber(metrics.totalPrompts),
        },
        {
          label: 'Templates Created',
          value: formatNumber(metrics.totalTemplates),
        },
        {
          label: 'Avg. Time Saved',
          value: '15hrs/week', // This would come from analytics
        },
      ]
    : [
        { label: 'Active Users', value: '—' },
        { label: 'Prompts Generated', value: '—' },
        { label: 'Templates Created', value: '—' },
        { label: 'Avg. Time Saved', value: '—' },
      ];

  return <SocialProof stats={stats} showLiveActivity={false} />;
}
