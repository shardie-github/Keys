'use client';

interface GuaranteeBadgeProps {
  guarantees: string[];
  tier: string;
  className?: string;
}

export function GuaranteeBadge({ guarantees, tier, className = '' }: GuaranteeBadgeProps) {
  if (!guarantees || guarantees.length === 0) {
    return null;
  }

  const guaranteeLabels: Record<string, { label: string; icon: string; color: string }> = {
    security: {
      label: 'Security Guarantee',
      icon: '🔒',
      color: 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800',
    },
    compliance: {
      label: 'Compliance Guarantee',
      icon: '🛡️',
      color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800',
    },
    quality: {
      label: 'Quality Guarantee',
      icon: '✨',
      color: 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800',
    },
    sla: {
      label: 'SLA Guarantee',
      icon: '⚡',
      color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800',
    },
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        Your Guarantees:
      </h4>
      <div className="flex flex-wrap gap-2">
        {guarantees.map((guarantee) => {
          const config = guaranteeLabels[guarantee.toLowerCase()];
          if (!config) return null;

          return (
            <div
              key={guarantee}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${config.color}`}
              title={`${config.label}: We're liable if we miss ${guarantee} issues`}
            >
              <span className="mr-1">{config.icon}</span>
              {config.label}
            </div>
          );
        })}
      </div>
      {tier !== 'enterprise' && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          <a href="/pricing" className="underline hover:text-blue-600 dark:hover:text-blue-400">
            Upgrade to Enterprise
          </a>
          {' '}for SLA guarantee
        </p>
      )}
    </div>
  );
}
