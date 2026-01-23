#!/usr/bin/env tsx
/**
 * Clean Script
 *
 * Removes build artifacts and temporary files for a clean rebuild
 */

import { execSync } from 'child_process';
import { rmSync, existsSync } from 'fs';
import { join } from 'path';

const dirsToClean = [
  // Root
  'node_modules',
  'package-lock.json',

  // Backend
  'backend/dist',
  'backend/node_modules',
  'backend/package-lock.json',
  'backend/.turbo',

  // Frontend
  'frontend/.next',
  'frontend/node_modules',
  'frontend/package-lock.json',
  'frontend/.turbo',
  'frontend/out',

  // Test outputs
  'frontend/playwright-report',
  'frontend/test-results',
  'backend/coverage',

  // Temporary files
  '.DS_Store',
  '**/.DS_Store',
];

console.log('🧹 Cleaning build artifacts and dependencies...\n');

let cleanedCount = 0;
let failedCount = 0;

for (const dir of dirsToClean) {
  const fullPath = join(process.cwd(), dir);

  if (existsSync(fullPath)) {
    try {
      console.log(`   Removing: ${dir}`);
      rmSync(fullPath, { recursive: true, force: true });
      cleanedCount++;
    } catch (error) {
      console.error(`   ✗ Failed to remove ${dir}:`, error instanceof Error ? error.message : error);
      failedCount++;
    }
  }
}

console.log(`\n✅ Cleaned ${cleanedCount} items`);
if (failedCount > 0) {
  console.log(`⚠️  Failed to clean ${failedCount} items`);
}

console.log('\n📦 To reinstall dependencies, run: npm install\n');
