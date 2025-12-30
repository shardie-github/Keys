/**
 * AAAA-Grade Health Check System
 * Comprehensive health checks for all system components
 */

import { createClient } from '@supabase/supabase-js';
import { getRedis } from '../cache/redis.js';
import { logger } from './logger.js';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: ComponentHealth[];
  overallScore: number; // 0-100
}

export interface ComponentHealth {
  component: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency?: number;
  message: string;
  lastChecked: string;
}

class HealthCheckService {
  /**
   * Run comprehensive health checks
   */
  async runHealthChecks(): Promise<HealthCheckResult> {
    const checks: ComponentHealth[] = [];
    
    // Check database
    checks.push(await this.checkDatabase());
    
    // Check Redis
    checks.push(await this.checkRedis());
    
    // Check external APIs (if configured)
    if (process.env.OPENAI_API_KEY) {
      checks.push(await this.checkOpenAI());
    }
    
    // Calculate overall status
    const healthyCount = checks.filter((c) => c.status === 'healthy').length;
    const degradedCount = checks.filter((c) => c.status === 'degraded').length;
    const unhealthyCount = checks.filter((c) => c.status === 'unhealthy').length;
    
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (unhealthyCount > 0) {
      overallStatus = 'unhealthy';
    } else if (degradedCount > 0) {
      overallStatus = 'degraded';
    }
    
    const overallScore = (healthyCount / checks.length) * 100;
    
    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks,
      overallScore,
    };
  }

  private async checkDatabase(): Promise<ComponentHealth> {
    const startTime = Date.now();
    
    try {
      const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      // Simple query to check connectivity
      const { error } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1);
      
      const latency = Date.now() - startTime;
      
      if (error) {
        return {
          component: 'database',
          status: 'unhealthy',
          latency,
          message: `Database error: ${error.message}`,
          lastChecked: new Date().toISOString(),
        };
      }
      
      if (latency > 500) {
        return {
          component: 'database',
          status: 'degraded',
          latency,
          message: `Database slow: ${latency}ms`,
          lastChecked: new Date().toISOString(),
        };
      }
      
      return {
        component: 'database',
        status: 'healthy',
        latency,
        message: 'Database connection healthy',
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        component: 'database',
        status: 'unhealthy',
        message: `Database check failed: ${(error as Error).message}`,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  private async checkRedis(): Promise<ComponentHealth> {
    const startTime = Date.now();
    
    try {
      const redis = getRedis();
      
      if (!redis) {
        return {
          component: 'redis',
          status: 'degraded',
          message: 'Redis not configured (caching disabled)',
          lastChecked: new Date().toISOString(),
        };
      }
      
      await redis.ping();
      const latency = Date.now() - startTime;
      
      if (latency > 100) {
        return {
          component: 'redis',
          status: 'degraded',
          latency,
          message: `Redis slow: ${latency}ms`,
          lastChecked: new Date().toISOString(),
        };
      }
      
      return {
        component: 'redis',
        status: 'healthy',
        latency,
        message: 'Redis connection healthy',
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        component: 'redis',
        status: 'unhealthy',
        message: `Redis check failed: ${(error as Error).message}`,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  private async checkOpenAI(): Promise<ComponentHealth> {
    const startTime = Date.now();
    
    try {
      // Simple check - verify API key is valid format
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey || apiKey.length < 20) {
        return {
          component: 'openai',
          status: 'degraded',
          message: 'OpenAI API key not properly configured',
          lastChecked: new Date().toISOString(),
        };
      }
      
      return {
        component: 'openai',
        status: 'healthy',
        message: 'OpenAI API key configured',
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        component: 'openai',
        status: 'unhealthy',
        message: `OpenAI check failed: ${(error as Error).message}`,
        lastChecked: new Date().toISOString(),
      };
    }
  }
}

export const healthCheckService = new HealthCheckService();
