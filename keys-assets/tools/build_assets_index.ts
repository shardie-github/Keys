#!/usr/bin/env tsx
/**
 * Asset Index Builder
 * 
 * Scans assets and generates index files for distribution
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

const ASSETS_ROOT = resolve(__dirname, '..');
const DIST_DIR = join(ASSETS_ROOT, 'dist');

interface RunbookIndex {
  slug: string;
  title: string;
  description: string;
  key_type: string[];
  severity_level?: string;
  version: string;
  outcome: string;
  maturity: string;
  tags: string[];
}

interface NodeKeyIndex {
  slug: string;
  title: string;
  description: string;
  tool: string;
  key_type: string[];
  runtime: string;
  version: string;
  outcome: string;
  maturity: string;
  tags: string[];
}

interface AssetsIndex {
  version: string;
  generated_at: string;
  runbooks: RunbookIndex[];
  node_keys: NodeKeyIndex[];
}

/**
 * Build runbook index
 */
function buildRunbookIndex(): RunbookIndex[] {
  const runbooksDir = join(ASSETS_ROOT, 'runbook-keys');
  const index: RunbookIndex[] = [];

  if (!existsSync(runbooksDir)) {
    return index;
  }

  const runbooks = readdirSync(runbooksDir).filter(item => {
    const itemPath = join(runbooksDir, item);
    return statSync(itemPath).isDirectory();
  });

  for (const slug of runbooks) {
    const packJsonPath = join(runbooksDir, slug, 'pack.json');
    if (!existsSync(packJsonPath)) {
      continue;
    }

    try {
      const packData = JSON.parse(readFileSync(packJsonPath, 'utf-8'));
      index.push({
        slug: packData.slug,
        title: packData.title,
        description: packData.description,
        key_type: packData.key_type,
        severity_level: packData.severity_level,
        version: packData.version,
        outcome: packData.outcome,
        maturity: packData.maturity,
        tags: packData.tags || []
      });
    } catch (e) {
      console.error(`Error reading ${packJsonPath}:`, e);
    }
  }

  return index;
}

/**
 * Build node key index
 */
function buildNodeKeyIndex(): NodeKeyIndex[] {
  const nodeKeysDir = join(ASSETS_ROOT, 'node-next-keys');
  const index: NodeKeyIndex[] = [];

  if (!existsSync(nodeKeysDir)) {
    return index;
  }

  const nodeKeys = readdirSync(nodeKeysDir).filter(item => {
    const itemPath = join(nodeKeysDir, item);
    return statSync(itemPath).isDirectory();
  });

  for (const slug of nodeKeys) {
    const keyJsonPath = join(nodeKeysDir, slug, 'key.json');
    if (!existsSync(keyJsonPath)) {
      continue;
    }

    try {
      const keyData = JSON.parse(readFileSync(keyJsonPath, 'utf-8'));
      index.push({
        slug: keyData.slug,
        title: keyData.title,
        description: keyData.description,
        tool: keyData.tool,
        key_type: keyData.key_type,
        runtime: keyData.runtime,
        version: keyData.version,
        outcome: keyData.outcome,
        maturity: keyData.maturity,
        tags: keyData.tags || []
      });
    } catch (e) {
      console.error(`Error reading ${keyJsonPath}:`, e);
    }
  }

  return index;
}

/**
 * Build complete assets index
 */
function buildAssetsIndex(): AssetsIndex {
  const runbooks = buildRunbookIndex();
  const nodeKeys = buildNodeKeyIndex();

  return {
    version: '1.0.0',
    generated_at: new Date().toISOString(),
    runbooks,
    node_keys: nodeKeys
  };
}

/**
 * Main function
 */
function main() {
  console.log('📦 Building assets index...\n');

  // Ensure dist directory exists
  if (!existsSync(DIST_DIR)) {
    const { mkdirSync } = require('fs');
    mkdirSync(DIST_DIR, { recursive: true });
  }

  // Build index
  const index = buildAssetsIndex();

  // Write index file
  const indexPath = join(DIST_DIR, 'assets-index.json');
  writeFileSync(indexPath, JSON.stringify(index, null, 2));

  console.log(`✅ Generated index: ${indexPath}`);
  console.log(`   - Runbooks: ${index.runbooks.length}`);
  console.log(`   - Node Keys: ${index.node_keys.length}\n`);

  // Also generate individual pack files for distribution
  const packsDir = join(DIST_DIR, 'packs');
  if (!existsSync(packsDir)) {
    const { mkdirSync } = require('fs');
    mkdirSync(packsDir, { recursive: true });
  }

  // Copy runbook packs
  for (const runbook of index.runbooks) {
    const sourceDir = join(ASSETS_ROOT, 'runbook-keys', runbook.slug);
    const targetDir = join(packsDir, `runbook-${runbook.slug}`);
    if (existsSync(sourceDir)) {
      // In a real implementation, you might zip these or copy selectively
      console.log(`   📄 Runbook: ${runbook.slug}`);
    }
  }

  // Copy node key packs
  for (const nodeKey of index.node_keys) {
    const sourceDir = join(ASSETS_ROOT, 'node-next-keys', nodeKey.slug);
    const targetDir = join(packsDir, `node-${nodeKey.slug}`);
    if (existsSync(sourceDir)) {
      // In a real implementation, you might zip these or copy selectively
      console.log(`   📄 Node Key: ${nodeKey.slug}`);
    }
  }
}

if (require.main === module) {
  main();
}

export { buildAssetsIndex, buildRunbookIndex, buildNodeKeyIndex };
