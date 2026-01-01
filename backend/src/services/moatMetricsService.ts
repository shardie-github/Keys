/**
 * Moat Metrics Service
 * 
 * Tracks leading indicators of lock-in and defensibility:
 * - Failure pattern accumulation
 * - Pattern match frequency
 * - Prevention rule application
 * - Cross-project pattern usage
 * - Daily usage frequency
 * - Integration usage
 * - Guarantee dependency
 */

import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface LockInMetrics {
  userId: string;
  failurePatternCount: number;
  patternMatchFrequency: number; // per month
  preventionRuleApplications: number; // per month
  crossProjectPatternUsage: number; // number of projects using shared patterns
  dailyUsageFrequency: number; // days per month with usage
  ideIntegrationUsage: number; // IDE extension uses per month
  cicdIntegrationUsage: number; // CI/CD checks per month
  guaranteeDependency: number; // security/compliance checks per month
  lockInScore: number; // 0-100
  lockInLevel: 'none' | 'moderate' | 'strong';
}

export interface ChurnPredictionMetrics {
  userId: string;
  churnRiskScore: number; // 0-100 (higher = more likely to churn)
  churnRiskLevel: 'low' | 'medium' | 'high';
  indicators: {
    lowUsage: boolean;
    noGuaranteeDependency: boolean;
    noIntegrationUsage: boolean;
    lowPatternAccumulation: boolean;
  };
}

export interface InfrastructureSignals {
  userId: string;
  deploymentBlocks: number; // per month
  failurePreventionRate: number; // percentage
  complianceChecks: number; // per month
  auditLogQueries: number; // per month
  infrastructureStatus: 'none' | 'moderate' | 'strong';
}

export class MoatMetricsService {
  /**
   * Calculate lock-in metrics for a user
   */
  async getLockInMetrics(userId: string): Promise<LockInMetrics> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthStartISO = monthStart.toISOString();

    // Get failure pattern count
    const { count: failurePatternCount } = await supabase
      .from('failure_patterns')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get pattern matches this month
    const { count: patternMatches } = await supabase
      .from('pattern_matches')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', monthStartISO);

    // Get prevention rule applications (from agent_runs with prevention rules)
    const { count: preventionApplications } = await supabase
      .from('agent_runs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', monthStartISO)
      .not('safety_check_results', 'is', null);

    // Get cross-project pattern usage (distinct projects using patterns)
    const { data: patternUsage } = await supabase
      .from('pattern_matches')
      .select('detected_in')
      .eq('user_id', userId)
      .gte('created_at', monthStartISO);

    const crossProjectUsage = new Set(patternUsage?.map(p => p.detected_in).filter(Boolean)).size;

    // Get daily usage frequency (days per month with at least one run)
    const { data: dailyUsage } = await supabase
      .from('agent_runs')
      .select('created_at')
      .eq('user_id', userId)
      .gte('created_at', monthStartISO);

    const uniqueDays = new Set(
      dailyUsage?.map(run => new Date(run.created_at).toDateString()) || []
    ).size;

    // Get integration usage (would need integration_usage table or track in agent_runs metadata)
    // For now, estimate based on user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('integration_access')
      .eq('user_id', userId)
      .single();

    const hasIDE = profile?.integration_access?.includes('ide') || false;
    const hasCICD = profile?.integration_access?.includes('cicd') || false;

    // Estimate integration usage (would be tracked separately in production)
    const ideUsage = hasIDE ? Math.floor(uniqueDays * 10) : 0; // Estimate 10 uses per day
    const cicdUsage = hasCICD ? Math.floor(uniqueDays * 2) : 0; // Estimate 2 checks per day

    // Get guarantee dependency (safety checks)
    const { count: guaranteeChecks } = await supabase
      .from('agent_runs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', monthStartISO)
      .not('safety_check_results', 'is', null);

    // Calculate lock-in score (0-100)
    let lockInScore = 0;
    
    // Failure patterns (0-30 points)
    if (failurePatternCount && failurePatternCount >= 100) lockInScore += 30;
    else if (failurePatternCount && failurePatternCount >= 50) lockInScore += 20;
    else if (failurePatternCount && failurePatternCount >= 10) lockInScore += 10;

    // Pattern matches (0-20 points)
    if (patternMatches && patternMatches >= 50) lockInScore += 20;
    else if (patternMatches && patternMatches >= 20) lockInScore += 15;
    else if (patternMatches && patternMatches >= 10) lockInScore += 10;

    // Daily usage (0-20 points)
    if (uniqueDays >= 25) lockInScore += 20;
    else if (uniqueDays >= 20) lockInScore += 15;
    else if (uniqueDays >= 10) lockInScore += 10;

    // Integration usage (0-15 points)
    if (ideUsage >= 200 || cicdUsage >= 50) lockInScore += 15;
    else if (ideUsage >= 100 || cicdUsage >= 25) lockInScore += 10;
    else if (ideUsage >= 50 || cicdUsage >= 10) lockInScore += 5;

    // Guarantee dependency (0-15 points)
    if (guaranteeChecks && guaranteeChecks >= 500) lockInScore += 15;
    else if (guaranteeChecks && guaranteeChecks >= 100) lockInScore += 10;
    else if (guaranteeChecks && guaranteeChecks >= 50) lockInScore += 5;

    const lockInLevel: 'none' | 'moderate' | 'strong' =
      lockInScore >= 70 ? 'strong' : lockInScore >= 40 ? 'moderate' : 'none';

    return {
      userId,
      failurePatternCount: failurePatternCount || 0,
      patternMatchFrequency: patternMatches || 0,
      preventionRuleApplications: preventionApplications || 0,
      crossProjectPatternUsage: crossProjectUsage,
      dailyUsageFrequency: uniqueDays,
      ideIntegrationUsage: ideUsage,
      cicdIntegrationUsage: cicdUsage,
      guaranteeDependency: guaranteeChecks || 0,
      lockInScore,
      lockInLevel,
    };
  }

  /**
   * Predict churn risk for a user
   */
  async getChurnPrediction(userId: string): Promise<ChurnPredictionMetrics> {
    const lockInMetrics = await this.getLockInMetrics(userId);

    let churnRiskScore = 100; // Start at 100 (highest risk)

    // Reduce risk based on lock-in indicators
    if (lockInMetrics.failurePatternCount >= 100) churnRiskScore -= 30;
    else if (lockInMetrics.failurePatternCount >= 50) churnRiskScore -= 20;
    else if (lockInMetrics.failurePatternCount >= 10) churnRiskScore -= 10;

    if (lockInMetrics.dailyUsageFrequency >= 25) churnRiskScore -= 25;
    else if (lockInMetrics.dailyUsageFrequency >= 20) churnRiskScore -= 15;
    else if (lockInMetrics.dailyUsageFrequency >= 10) churnRiskScore -= 10;

    if (lockInMetrics.ideIntegrationUsage >= 200 || lockInMetrics.cicdIntegrationUsage >= 50) {
      churnRiskScore -= 20;
    } else if (lockInMetrics.ideIntegrationUsage >= 100 || lockInMetrics.cicdIntegrationUsage >= 25) {
      churnRiskScore -= 10;
    }

    if (lockInMetrics.guaranteeDependency >= 500) churnRiskScore -= 15;
    else if (lockInMetrics.guaranteeDependency >= 100) churnRiskScore -= 10;

    churnRiskScore = Math.max(0, Math.min(100, churnRiskScore));

    const churnRiskLevel: 'low' | 'medium' | 'high' =
      churnRiskScore <= 30 ? 'low' : churnRiskScore <= 60 ? 'medium' : 'high';

    return {
      userId,
      churnRiskScore,
      churnRiskLevel,
      indicators: {
        lowUsage: lockInMetrics.dailyUsageFrequency < 10,
        noGuaranteeDependency: lockInMetrics.guaranteeDependency < 50,
        noIntegrationUsage: lockInMetrics.ideIntegrationUsage === 0 && lockInMetrics.cicdIntegrationUsage === 0,
        lowPatternAccumulation: lockInMetrics.failurePatternCount < 50,
      },
    };
  }

  /**
   * Get infrastructure signals
   */
  async getInfrastructureSignals(userId: string): Promise<InfrastructureSignals> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthStartISO = monthStart.toISOString();

    // Get deployment blocks (would be tracked in CI/CD integration)
    // For now, estimate based on blocked outputs
    const { count: blockedOutputs } = await supabase
      .from('agent_runs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', monthStartISO)
      .eq('safety_checks_passed', false);

    // Get total runs
    const { count: totalRuns } = await supabase
      .from('agent_runs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', monthStartISO);

    const failurePreventionRate = totalRuns && totalRuns > 0
      ? Math.round((blockedOutputs || 0) / totalRuns * 100)
      : 0;

    // Get compliance checks
    const { count: complianceChecks } = await supabase
      .from('agent_runs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', monthStartISO)
      .not('safety_check_results', 'is', null);

    // Get audit log queries (would be tracked separately)
    // Estimate based on compliance checks
    const auditLogQueries = Math.floor((complianceChecks || 0) / 10);

    const infrastructureStatus: 'none' | 'moderate' | 'strong' =
      blockedOutputs && blockedOutputs >= 5 && failurePreventionRate >= 80
        ? 'strong'
        : blockedOutputs && blockedOutputs >= 1 && failurePreventionRate >= 50
        ? 'moderate'
        : 'none';

    return {
      userId,
      deploymentBlocks: blockedOutputs || 0,
      failurePreventionRate,
      complianceChecks: complianceChecks || 0,
      auditLogQueries,
      infrastructureStatus,
    };
  }

  /**
   * Calculate institutional memory value
   */
  async getInstitutionalMemoryValue(userId: string): Promise<{
    failurePatternsValue: number;
    successPatternsValue: number;
    auditTrailsValue: number;
    totalValue: number;
    estimatedSwitchingCost: number;
  }> {
    const { count: failurePatternCount } = await supabase
      .from('failure_patterns')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: successPatternCount } = await supabase
      .from('success_patterns')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: auditTrailCount } = await supabase
      .from('agent_runs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const failurePatternsValue = (failurePatternCount || 0) * 10; // $10 per pattern
    const successPatternsValue = (successPatternCount || 0) * 5; // $5 per pattern
    const auditTrailsValue = (auditTrailCount || 0) * 1; // $1 per record
    const totalValue = failurePatternsValue + successPatternsValue + auditTrailsValue;

    // Estimated switching cost (value lost + time to rebuild)
    const estimatedSwitchingCost = totalValue + (failurePatternCount || 0) * 100; // $100 per pattern to rebuild

    return {
      failurePatternsValue,
      successPatternsValue,
      auditTrailsValue,
      totalValue,
      estimatedSwitchingCost,
    };
  }
}

export const moatMetricsService = new MoatMetricsService();
