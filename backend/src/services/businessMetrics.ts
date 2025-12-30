/**
 * AAAA-Grade Business Metrics Service
 * Tracks user activation, feature adoption, NPS, churn, revenue, costs
 */

import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';
import { kpiTracker } from '../monitoring/kpiTracker.js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface BusinessMetrics {
  userActivationRate: number;
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  featureAdoption: Record<string, number>;
  userSatisfactionNPS: number;
  churnRate: number;
  revenuePerUser: number;
  costPerUser: number;
}

class BusinessMetricsService {
  /**
   * Calculate user activation rate
   * Activation = users who completed onboarding / total signups
   */
  async calculateActivationRate(days: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      // Get total signups
      const { count: totalSignups } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', cutoffDate.toISOString());

      // Get activated users (completed onboarding - has profile with role/stack)
      const { count: activatedUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', cutoffDate.toISOString())
        .not('role', 'is', null);

      if (!totalSignups || totalSignups === 0) {
        return 0;
      }

      const rate = (activatedUsers || 0) / totalSignups * 100;
      
      // Update KPI tracker
      const metrics = kpiTracker.getMetrics();
      if (metrics.business) {
        metrics.business.userActivationRate = rate;
      }

      return rate;
    } catch (error) {
      logger.error('Error calculating activation rate', error as Error);
      return 0;
    }
  }

  /**
   * Calculate active users (DAU, WAU, MAU)
   */
  async calculateActiveUsers(): Promise<{
    daily: number;
    weekly: number;
    monthly: number;
  }> {
    try {
      const now = new Date();
      const dailyCutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const weeklyCutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthlyCutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Count users with activity (agent runs) in each period
      const { count: daily } = await supabase
        .from('agent_runs')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', dailyCutoff.toISOString());

      const { count: weekly } = await supabase
        .from('agent_runs')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', weeklyCutoff.toISOString());

      const { count: monthly } = await supabase
        .from('agent_runs')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', monthlyCutoff.toISOString());

      const metrics = kpiTracker.getMetrics();
      if (metrics.business) {
        metrics.business.dailyActiveUsers = daily || 0;
        metrics.business.weeklyActiveUsers = weekly || 0;
        metrics.business.monthlyActiveUsers = monthly || 0;
      }

      return {
        daily: daily || 0,
        weekly: weekly || 0,
        monthly: monthly || 0,
      };
    } catch (error) {
      logger.error('Error calculating active users', error as Error);
      return { daily: 0, weekly: 0, monthly: 0 };
    }
  }

  /**
   * Calculate feature adoption rates
   */
  async calculateFeatureAdoption(): Promise<Record<string, number>> {
    try {
      const { count: totalUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      if (!totalUsers || totalUsers === 0) {
        return {};
      }

      const adoption: Record<string, number> = {};

      // Feature: Chat usage
      const { count: chatUsers } = await supabase
        .from('agent_runs')
        .select('user_id', { count: 'exact', head: true });
      adoption.chat = ((chatUsers || 0) / totalUsers) * 100;

      // Feature: Templates
      const { count: templateUsers } = await supabase
        .from('user_template_customizations')
        .select('user_id', { count: 'exact', head: true });
      adoption.templates = ((templateUsers || 0) / totalUsers) * 100;

      // Feature: Vibe configs
      const { count: vibeUsers } = await supabase
        .from('vibe_configs')
        .select('user_id', { count: 'exact', head: true });
      adoption.vibeConfigs = ((vibeUsers || 0) / totalUsers) * 100;

      // Update KPI tracker
      const metrics = kpiTracker.getMetrics();
      if (metrics.business) {
        metrics.business.featureAdoptionRate = adoption;
      }

      return adoption;
    } catch (error) {
      logger.error('Error calculating feature adoption', error as Error);
      return {};
    }
  }

  /**
   * Calculate cost per user (LLM API costs)
   */
  async calculateCostPerUser(): Promise<number> {
    try {
      const { data: runs } = await supabase
        .from('agent_runs')
        .select('cost_usd, user_id')
        .not('cost_usd', 'is', null);

      if (!runs || runs.length === 0) {
        return 0;
      }

      const totalCost = runs.reduce((sum, run) => sum + (run.cost_usd || 0), 0);
      const uniqueUsers = new Set(runs.map((run) => run.user_id)).size;
      
      const costPerUser = uniqueUsers > 0 ? totalCost / uniqueUsers : 0;

      // Update KPI tracker
      const metrics = kpiTracker.getMetrics();
      if (metrics.business) {
        metrics.business.costPerUser = costPerUser;
      }

      return costPerUser;
    } catch (error) {
      logger.error('Error calculating cost per user', error as Error);
      return 0;
    }
  }

  /**
   * Get all business metrics
   */
  async getAllMetrics(): Promise<BusinessMetrics> {
    const [activationRate, activeUsers, featureAdoption, costPerUser] = await Promise.all([
      this.calculateActivationRate(),
      this.calculateActiveUsers(),
      this.calculateFeatureAdoption(),
      this.calculateCostPerUser(),
    ]);

    return {
      userActivationRate: activationRate,
      dailyActiveUsers: activeUsers.daily,
      weeklyActiveUsers: activeUsers.weekly,
      monthlyActiveUsers: activeUsers.monthly,
      featureAdoption,
      userSatisfactionNPS: 0, // Would come from feedback system
      churnRate: 0, // Would calculate from user activity
      revenuePerUser: 0, // Would come from billing system
      costPerUser,
    };
  }
}

export const businessMetricsService = new BusinessMetricsService();
