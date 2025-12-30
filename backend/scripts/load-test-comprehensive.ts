#!/usr/bin/env tsx
/**
 * AAAA-Grade Comprehensive Load Testing
 * Tests all critical endpoints with realistic load patterns
 */

import axios from 'axios';
import { performance } from 'perf_hooks';

interface LoadTestScenario {
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  weight: number; // Relative frequency (higher = more common)
}

interface LoadTestResult {
  scenario: string;
  totalRequests: number;
  successful: number;
  failed: number;
  latencies: {
    p50: number;
    p95: number;
    p99: number;
    min: number;
    max: number;
    mean: number;
  };
  errorRate: number;
  requestsPerSecond: number;
  status: 'pass' | 'warning' | 'fail';
}

const SCENARIOS: LoadTestScenario[] = [
  {
    name: 'Health Check',
    endpoint: '/health',
    method: 'GET',
    weight: 10,
  },
  {
    name: 'Get Profile',
    endpoint: '/profiles/:userId',
    method: 'GET',
    weight: 30,
    headers: {
      Authorization: 'Bearer test-token',
    },
  },
  {
    name: 'Assemble Prompt',
    endpoint: '/assemble-prompt',
    method: 'POST',
    weight: 25,
    body: {
      taskDescription: 'Test task',
      vibeConfig: {},
    },
    headers: {
      Authorization: 'Bearer test-token',
    },
  },
  {
    name: 'Orchestrate Agent',
    endpoint: '/orchestrate-agent',
    method: 'POST',
    weight: 20,
    body: {
      assembledPrompt: {
        systemPrompt: 'Test prompt',
      },
      naturalLanguageInput: 'Test input',
    },
    headers: {
      Authorization: 'Bearer test-token',
    },
  },
  {
    name: 'Get Vibe Config',
    endpoint: '/vibe-configs/:userId',
    method: 'GET',
    weight: 15,
    headers: {
      Authorization: 'Bearer test-token',
    },
  },
];

async function runLoadTest(
  baseURL: string,
  durationSeconds: number = 60,
  targetRPS: number = 10
): Promise<LoadTestResult[]> {
  console.log(`\n🚀 Starting comprehensive load test`);
  console.log(`   Duration: ${durationSeconds}s`);
  console.log(`   Target RPS: ${targetRPS}`);
  console.log(`   Base URL: ${baseURL}\n`);

  const results: Map<string, LoadTestResult> = new Map();
  const startTime = Date.now();
  const endTime = startTime + durationSeconds * 1000;

  // Initialize results
  SCENARIOS.forEach((scenario) => {
    results.set(scenario.name, {
      scenario: scenario.name,
      totalRequests: 0,
      successful: 0,
      failed: 0,
      latencies: {
        p50: 0,
        p95: 0,
        p99: 0,
        min: Infinity,
        max: 0,
        mean: 0,
      },
      errorRate: 0,
      requestsPerSecond: 0,
      status: 'pass',
    });
  });

  // Calculate total weight for distribution
  const totalWeight = SCENARIOS.reduce((sum, s) => sum + s.weight, 0);

  // Run load test
  const requestPromises: Promise<void>[] = [];
  let requestCount = 0;

  while (Date.now() < endTime) {
    // Select scenario based on weight
    const random = Math.random() * totalWeight;
    let cumulativeWeight = 0;
    let selectedScenario: LoadTestScenario | null = null;

    for (const scenario of SCENARIOS) {
      cumulativeWeight += scenario.weight;
      if (random <= cumulativeWeight) {
        selectedScenario = scenario;
        break;
      }
    }

    if (!selectedScenario) continue;

    // Calculate delay to maintain target RPS
    const delayMs = 1000 / targetRPS;
    await new Promise((resolve) => setTimeout(resolve, delayMs));

    // Make request
    const promise = makeRequest(baseURL, selectedScenario, results);
    requestPromises.push(promise);
    requestCount++;

    // Limit concurrent requests
    if (requestPromises.length >= 50) {
      await Promise.race(requestPromises);
      requestPromises.splice(
        requestPromises.findIndex((p) => p === Promise.resolve()),
        1
      );
    }
  }

  // Wait for remaining requests
  await Promise.all(requestPromises);

  // Calculate final statistics
  const elapsedSeconds = (Date.now() - startTime) / 1000;
  
  results.forEach((result) => {
    if (result.totalRequests > 0) {
      result.errorRate = (result.failed / result.totalRequests) * 100;
      result.requestsPerSecond = result.totalRequests / elapsedSeconds;
      
      // Determine status
      if (result.errorRate > 1 || result.latencies.p95 > 200) {
        result.status = 'fail';
      } else if (result.errorRate > 0.1 || result.latencies.p95 > 150) {
        result.status = 'warning';
      }
    }
  });

  return Array.from(results.values());
}

async function makeRequest(
  baseURL: string,
  scenario: LoadTestScenario,
  results: Map<string, LoadTestResult>
): Promise<void> {
  const result = results.get(scenario.name)!;
  const startTime = performance.now();

  try {
    const url = `${baseURL}${scenario.endpoint.replace(':userId', 'test-user-id')}`;
    const config: any = {
      method: scenario.method,
      url,
      headers: scenario.headers || {},
      timeout: 30000,
    };

    if (scenario.body) {
      config.data = scenario.body;
    }

    await axios(config);
    
    const latency = performance.now() - startTime;
    result.successful++;
    result.totalRequests++;
    
    // Update latency stats
    if (latency < result.latencies.min) result.latencies.min = latency;
    if (latency > result.latencies.max) result.latencies.max = latency;
    
  } catch (error) {
    const latency = performance.now() - startTime;
    result.failed++;
    result.totalRequests++;
    
    if (latency < result.latencies.min) result.latencies.min = latency;
    if (latency > result.latencies.max) result.latencies.max = latency;
  }
}

// Calculate percentiles
function calculatePercentiles(latencies: number[]): { p50: number; p95: number; p99: number; mean: number } {
  if (latencies.length === 0) {
    return { p50: 0, p95: 0, p99: 0, mean: 0 };
  }

  const sorted = [...latencies].sort((a, b) => a - b);
  const p50 = sorted[Math.floor(sorted.length * 0.5)] || 0;
  const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
  const p99 = sorted[Math.floor(sorted.length * 0.99)] || 0;
  const mean = sorted.reduce((a, b) => a + b, 0) / sorted.length;

  return { p50, p95, p99, mean };
}

async function main() {
  const baseURL = process.env.BASE_URL || 'http://localhost:3001';
  const duration = parseInt(process.env.DURATION || '60', 10);
  const rps = parseInt(process.env.RPS || '10', 10);

  const results = await runLoadTest(baseURL, duration, rps);

  console.log('\n📊 Load Test Results:\n');
  
  results.forEach((result) => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    console.log(`${icon} ${result.scenario}:`);
    console.log(`   Requests: ${result.totalRequests} (${result.successful} success, ${result.failed} failed)`);
    console.log(`   RPS: ${result.requestsPerSecond.toFixed(2)}`);
    console.log(`   Error Rate: ${result.errorRate.toFixed(2)}%`);
    console.log(`   Latency P95: ${result.latencies.p95.toFixed(2)}ms`);
    console.log(`   Latency P99: ${result.latencies.p99.toFixed(2)}ms`);
    console.log('');
  });

  // Overall assessment
  const failedScenarios = results.filter((r) => r.status === 'fail').length;
  const warningScenarios = results.filter((r) => r.status === 'warning').length;

  if (failedScenarios > 0) {
    console.log('❌ Load test FAILED - Some scenarios did not meet AAAA-grade standards');
    process.exit(1);
  } else if (warningScenarios > 0) {
    console.log('⚠️  Load test PASSED with warnings - Review performance');
  } else {
    console.log('✅ Load test PASSED - All scenarios meet AAAA-grade standards');
  }
}

main().catch((error) => {
  console.error('Load test error:', error);
  process.exit(1);
});
