'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface LockInMetrics {
  failurePatternCount: number;
  patternMatchFrequency: number;
  dailyUsageFrequency: number;
  ideIntegrationUsage: number;
  cicdIntegrationUsage: number;
  guaranteeDependency: number;
  lockInScore: number;
  lockInLevel: 'none' | 'moderate' | 'strong';
}

interface ChurnPrediction {
  churnRiskScore: number;
  churnRiskLevel: 'low' | 'medium' | 'high';
  indicators: {
    lowUsage: boolean;
    noGuaranteeDependency: boolean;
    noIntegrationUsage: boolean;
    lowPatternAccumulation: boolean;
  };
}

interface InfrastructureSignals {
  deploymentBlocks: number;
  failurePreventionRate: number;
  complianceChecks: number;
  auditLogQueries: number;
  infrastructureStatus: 'none' | 'moderate' | 'strong';
}

interface InstitutionalMemoryValue {
  failurePatternsValue: number;
  successPatternsValue: number;
  auditTrailsValue: number;
  totalValue: number;
  estimatedSwitchingCost: number;
}

export function MoatMetricsDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [lockIn, setLockIn] = useState<LockInMetrics | null>(null);
  const [churnPrediction, setChurnPrediction] = useState<ChurnPrediction | null>(null);
  const [infrastructure, setInfrastructure] = useState<InfrastructureSignals | null>(null);
  const [memoryValue, setMemoryValue] = useState<InstitutionalMemoryValue | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchMetrics = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
        
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token || '';

        const response = await fetch(`${API_BASE_URL}/moat-metrics/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setLockIn(data.lockIn);
          setChurnPrediction(data.churnPrediction);
          setInfrastructure(data.infrastructure);
          setMemoryValue(data.memoryValue);
        }
      } catch (error) {
        console.error('Failed to fetch moat metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-slate-700">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/4"></div>
          <div className="h-20 bg-gray-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  const getLockInColor = (level: string) => {
    if (level === 'strong') return 'text-green-600 dark:text-green-400';
    if (level === 'moderate') return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getChurnRiskColor = (level: string) => {
    if (level === 'low') return 'text-green-600 dark:text-green-400';
    if (level === 'medium') return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Lock-In Metrics */}
      {lockIn && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Lock-In Metrics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <dt className="text-sm text-gray-600 dark:text-gray-400">Failure Patterns</dt>
              <dd className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {lockIn.failurePatternCount}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600 dark:text-gray-400">Pattern Matches/Month</dt>
              <dd className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {lockIn.patternMatchFrequency}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600 dark:text-gray-400">Daily Usage</dt>
              <dd className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {lockIn.dailyUsageFrequency} days
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600 dark:text-gray-400">Lock-In Score</dt>
              <dd className={`text-2xl font-bold ${getLockInColor(lockIn.lockInLevel)}`}>
                {lockIn.lockInScore}/100
              </dd>
              <dd className="text-sm capitalize">{lockIn.lockInLevel}</dd>
            </div>
          </div>
        </div>
      )}

      {/* Churn Prediction */}
      {churnPrediction && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Churn Prediction
          </h3>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Churn Risk Score</span>
              <span className={`text-2xl font-bold ${getChurnRiskColor(churnPrediction.churnRiskLevel)}`}>
                {churnPrediction.churnRiskScore}/100
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  churnPrediction.churnRiskLevel === 'low'
                    ? 'bg-green-500'
                    : churnPrediction.churnRiskLevel === 'medium'
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${churnPrediction.churnRiskScore}%` }}
              />
            </div>
            <p className="text-sm capitalize mt-2 text-gray-600 dark:text-gray-400">
              Risk Level: <span className={getChurnRiskColor(churnPrediction.churnRiskLevel)}>{churnPrediction.churnRiskLevel}</span>
            </p>
          </div>
          {Object.values(churnPrediction.indicators).some(Boolean) && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                Risk Indicators:
              </p>
              <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                {churnPrediction.indicators.lowUsage && <li>• Low usage frequency</li>}
                {churnPrediction.indicators.noGuaranteeDependency && <li>• No guarantee dependency</li>}
                {churnPrediction.indicators.noIntegrationUsage && <li>• No integration usage</li>}
                {churnPrediction.indicators.lowPatternAccumulation && <li>• Low pattern accumulation</li>}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Infrastructure Signals */}
      {infrastructure && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Infrastructure Signals
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <dt className="text-sm text-gray-600 dark:text-gray-400">Deployment Blocks</dt>
              <dd className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {infrastructure.deploymentBlocks}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600 dark:text-gray-400">Prevention Rate</dt>
              <dd className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {infrastructure.failurePreventionRate}%
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600 dark:text-gray-400">Compliance Checks</dt>
              <dd className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {infrastructure.complianceChecks}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600 dark:text-gray-400">Infrastructure Status</dt>
              <dd className={`text-lg font-bold capitalize ${getLockInColor(infrastructure.infrastructureStatus)}`}>
                {infrastructure.infrastructureStatus}
              </dd>
            </div>
          </div>
        </div>
      )}

      {/* Institutional Memory Value */}
      {memoryValue && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Institutional Memory Value
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <dt className="text-sm text-gray-600 dark:text-gray-400">Failure Patterns</dt>
              <dd className="text-xl font-bold text-gray-900 dark:text-gray-100">
                ${memoryValue.failurePatternsValue.toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600 dark:text-gray-400">Success Patterns</dt>
              <dd className="text-xl font-bold text-gray-900 dark:text-gray-100">
                ${memoryValue.successPatternsValue.toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600 dark:text-gray-400">Audit Trails</dt>
              <dd className="text-xl font-bold text-gray-900 dark:text-gray-100">
                ${memoryValue.auditTrailsValue.toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600 dark:text-gray-400">Total Value</dt>
              <dd className="text-xl font-bold text-green-600 dark:text-green-400">
                ${memoryValue.totalValue.toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600 dark:text-gray-400">Switching Cost</dt>
              <dd className="text-xl font-bold text-red-600 dark:text-red-400">
                ${memoryValue.estimatedSwitchingCost.toLocaleString()}
              </dd>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> Switching to alternatives would lose ${memoryValue.totalValue.toLocaleString()} in institutional memory value plus ${(memoryValue.estimatedSwitchingCost - memoryValue.totalValue).toLocaleString()} in rebuilding costs.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
