#!/usr/bin/env tsx
/**
 * Asset Validation Tool
 * 
 * Validates JSON schemas and required files for all assets in keys-assets/
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const ASSETS_ROOT = resolve(__dirname, '..');
const SCHEMAS_DIR = join(ASSETS_ROOT, 'schemas');

interface ValidationResult {
  asset: string;
  type: 'runbook' | 'node-key' | 'library';
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const results: ValidationResult[] = [];

// Load schemas
const packSchema = JSON.parse(readFileSync(join(SCHEMAS_DIR, 'pack.schema.json'), 'utf-8'));
const keySchema = JSON.parse(readFileSync(join(SCHEMAS_DIR, 'key.schema.json'), 'utf-8'));
const librarySchema = JSON.parse(readFileSync(join(SCHEMAS_DIR, 'library.schema.json'), 'utf-8'));

const validatePack = ajv.compile(packSchema);
const validateKey = ajv.compile(keySchema);
const validateLibrary = ajv.compile(librarySchema);

/**
 * Validate a runbook pack
 */
function validateRunbookPack(slug: string): ValidationResult {
  const packDir = join(ASSETS_ROOT, 'runbook-keys', slug);
  const packJsonPath = join(packDir, 'pack.json');
  const result: ValidationResult = {
    asset: slug,
    type: 'runbook',
    valid: true,
    errors: [],
    warnings: []
  };

  // Check pack.json exists
  if (!existsSync(packJsonPath)) {
    result.valid = false;
    result.errors.push(`pack.json not found`);
    return result;
  }

  // Parse and validate JSON
  let packData: any;
  try {
    packData = JSON.parse(readFileSync(packJsonPath, 'utf-8'));
  } catch (e) {
    result.valid = false;
    result.errors.push(`Invalid JSON: ${e instanceof Error ? e.message : String(e)}`);
    return result;
  }

  // Validate schema
  const valid = validatePack(packData);
  if (!valid) {
    result.valid = false;
    result.errors.push(...(validatePack.errors?.map(e => `${e.instancePath}: ${e.message}`) || []));
  }

  // Validate slug matches folder name
  if (packData.slug !== slug) {
    result.valid = false;
    result.errors.push(`Slug mismatch: pack.json has "${packData.slug}" but folder is "${slug}"`);
  }

  // Check required files
  const requiredFiles = ['README.md', 'checklist.md', 'CHANGELOG.md', 'LICENSE.txt'];
  for (const file of requiredFiles) {
    if (!existsSync(join(packDir, file))) {
      result.warnings.push(`Missing file: ${file}`);
    }
  }

  // Check documentation references
  if (packData.documentation) {
    for (const [key, path] of Object.entries(packData.documentation)) {
      if (!existsSync(join(packDir, path as string))) {
        result.warnings.push(`Documentation file not found: ${path}`);
      }
    }
  }

  return result;
}

/**
 * Validate a Node/Next key
 */
function validateNodeKey(slug: string): ValidationResult {
  const keyDir = join(ASSETS_ROOT, 'node-next-keys', slug);
  const keyJsonPath = join(keyDir, 'key.json');
  const result: ValidationResult = {
    asset: slug,
    type: 'node-key',
    valid: true,
    errors: [],
    warnings: []
  };

  // Check key.json exists
  if (!existsSync(keyJsonPath)) {
    result.valid = false;
    result.errors.push(`key.json not found`);
    return result;
  }

  // Parse and validate JSON
  let keyData: any;
  try {
    keyData = JSON.parse(readFileSync(keyJsonPath, 'utf-8'));
  } catch (e) {
    result.valid = false;
    result.errors.push(`Invalid JSON: ${e instanceof Error ? e.message : String(e)}`);
    return result;
  }

  // Validate schema
  const valid = validateKey(keyData);
  if (!valid) {
    result.valid = false;
    result.errors.push(...(validateKey.errors?.map(e => `${e.instancePath}: ${e.message}`) || []));
  }

  // Validate slug matches folder name
  if (keyData.slug !== slug) {
    result.valid = false;
    result.errors.push(`Slug mismatch: key.json has "${keyData.slug}" but folder is "${slug}"`);
  }

  // Check required files
  const requiredFiles = ['README.md', 'quickstart.md', 'CHANGELOG.md', 'LICENSE.txt'];
  for (const file of requiredFiles) {
    if (!existsSync(join(keyDir, file))) {
      result.warnings.push(`Missing file: ${file}`);
    }
  }

  // Check documentation references
  if (keyData.documentation) {
    for (const [key, path] of Object.entries(keyData.documentation)) {
      if (!existsSync(join(keyDir, path as string))) {
        result.warnings.push(`Documentation file not found: ${path}`);
      }
    }
  }

  // Check src directory exists
  if (!existsSync(join(keyDir, 'src'))) {
    result.warnings.push(`Missing src/ directory`);
  }

  return result;
}

/**
 * Validate library.json
 */
function validateLibrary(libraryPath: string): ValidationResult {
  const result: ValidationResult = {
    asset: libraryPath,
    type: 'library',
    valid: true,
    errors: [],
    warnings: []
  };

  if (!existsSync(libraryPath)) {
    result.valid = false;
    result.errors.push(`library.json not found at ${libraryPath}`);
    return result;
  }

  let libraryData: any;
  try {
    libraryData = JSON.parse(readFileSync(libraryPath, 'utf-8'));
  } catch (e) {
    result.valid = false;
    result.errors.push(`Invalid JSON: ${e instanceof Error ? e.message : String(e)}`);
    return result;
  }

  // Validate schema
  const valid = validateLibrary(libraryData);
  if (!valid) {
    result.valid = false;
    result.errors.push(...(validateLibrary.errors?.map(e => `${e.instancePath}: ${e.message}`) || []));
  }

  // Validate packs array
  if (libraryData.packs && Array.isArray(libraryData.packs)) {
    if (libraryData.packs.length === 0) {
      result.warnings.push('packs array is empty');
    }
  }

  return result;
}

/**
 * Main validation function
 */
function main() {
  const args = process.argv.slice(2);
  const typeFilter = args.find(arg => arg.startsWith('--type='))?.split('=')[1];

  console.log('🔍 Validating assets...\n');

  // Validate runbooks
  if (!typeFilter || typeFilter === 'runbooks') {
    const runbooksDir = join(ASSETS_ROOT, 'runbook-keys');
    if (existsSync(runbooksDir)) {
      const runbooks = readdirSync(runbooksDir).filter(item => {
        const itemPath = join(runbooksDir, item);
        return statSync(itemPath).isDirectory();
      });

      for (const runbook of runbooks) {
        results.push(validateRunbookPack(runbook));
      }
    }
  }

  // Validate node keys
  if (!typeFilter || typeFilter === 'node-keys') {
    const nodeKeysDir = join(ASSETS_ROOT, 'node-next-keys');
    if (existsSync(nodeKeysDir)) {
      const nodeKeys = readdirSync(nodeKeysDir).filter(item => {
        const itemPath = join(nodeKeysDir, item);
        return statSync(itemPath).isDirectory();
      });

      for (const key of nodeKeys) {
        results.push(validateNodeKey(key));
      }
    }
  }

  // Validate library.json if present
  if (!typeFilter || typeFilter === 'library') {
    const libraryPath = join(ASSETS_ROOT, 'dist', 'library.json');
    if (existsSync(libraryPath)) {
      results.push(validateLibrary(libraryPath));
    }
  }

  // Print results
  const validCount = results.filter(r => r.valid).length;
  const invalidCount = results.filter(r => !r.valid).length;
  const warningCount = results.reduce((sum, r) => sum + r.warnings.length, 0);

  console.log(`\n✅ Valid: ${validCount}`);
  console.log(`❌ Invalid: ${invalidCount}`);
  console.log(`⚠️  Warnings: ${warningCount}\n`);

  for (const result of results) {
    if (!result.valid) {
      console.log(`❌ ${result.type}: ${result.asset}`);
      for (const error of result.errors) {
        console.log(`   - ${error}`);
      }
    } else if (result.warnings.length > 0) {
      console.log(`⚠️  ${result.type}: ${result.asset}`);
      for (const warning of result.warnings) {
        console.log(`   - ${warning}`);
      }
    } else {
      console.log(`✅ ${result.type}: ${result.asset}`);
    }
  }

  // Exit with error code if any invalid
  if (invalidCount > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { validateRunbookPack, validateNodeKey, validateLibrary };
