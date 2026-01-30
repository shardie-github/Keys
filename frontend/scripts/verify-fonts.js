#!/usr/bin/env node

/**
 * Font Verification Script
 * 
 * This script scans the codebase for Google Fonts usage and fails if found.
 * The project policy requires local fonts only (no remote Google Fonts).
 * 
 * Searches for:
 * - fonts.googleapis.com
 * - fonts.gstatic.com
 * - next/font/google
 */

const fs = require('fs');
const path = require('path');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const EXCLUDED_DIRS = [
  'node_modules',
  '.next',
  'dist',
  'build',
  'out',
  '.git',
  'coverage',
  'scripts' // Exclude this script itself
];

const PATTERNS = [
  { pattern: /fonts\.googleapis\.com/gi, name: 'Google Fonts API URL' },
  { pattern: /fonts\.gstatic\.com/gi, name: 'Google Fonts Static URL' },
  { pattern: /next\/font\/google/gi, name: 'next/font/google import' },
  { pattern: /@import\s+url\([^)]*fonts\.googleapis/gi, name: 'CSS @import Google Fonts' },
  { pattern: /<link[^>]*fonts\.googleapis/gi, name: 'HTML link Google Fonts' }
];

// File extensions to scan
const SCAN_EXTENSIONS = [
  '.js', '.jsx', '.ts', '.tsx',
  '.css', '.scss', '.sass', '.less',
  '.html', '.htm',
  '.json', '.md',
  '.vue', '.svelte'
];

let violationsFound = 0;
const violations = [];

/**
 * Check if a file should be scanned
 */
function shouldScanFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!SCAN_EXTENSIONS.includes(ext)) {
    return false;
  }
  
  // Check if file is in excluded directory
  const parts = filePath.split(path.sep);
  for (const part of parts) {
    if (EXCLUDED_DIRS.includes(part)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Scan a single file for font violations
 */
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(ROOT_DIR, filePath);
    
    for (const { pattern, name } of PATTERNS) {
      const matches = content.match(pattern);
      if (matches) {
        violationsFound++;
        violations.push({
          file: relativePath,
          pattern: name,
          count: matches.length
        });
        
        // Show context (first match line)
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (pattern.test(lines[i])) {
            console.log(`\n❌ VIOLATION: ${name}`);
            console.log(`   File: ${relativePath}:${i + 1}`);
            console.log(`   Line: ${lines[i].trim().substring(0, 100)}${lines[i].length > 100 ? '...' : ''}`);
            break;
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning ${filePath}: ${error.message}`);
  }
}

/**
 * Recursively scan directory
 */
function scanDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      if (!EXCLUDED_DIRS.includes(entry.name)) {
        scanDirectory(fullPath);
      }
    } else if (entry.isFile() && shouldScanFile(fullPath)) {
      scanFile(fullPath);
    }
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Scanning for Google Fonts violations...\n');
  console.log('Project policy: Local fonts only (no remote Google Fonts)\n');
  
  // Start scanning from root
  scanDirectory(ROOT_DIR);
  
  console.log('\n' + '='.repeat(60));
  
  if (violationsFound === 0) {
    console.log('✅ PASS: No Google Fonts references found!');
    console.log('   Project uses local fonts only.');
    process.exit(0);
  } else {
    console.log(`❌ FAIL: Found ${violationsFound} Google Fonts violation${violationsFound === 1 ? '' : 's'}!`);
    console.log('\nViolations summary:');
    
    // Group by pattern type
    const byPattern = {};
    for (const v of violations) {
      if (!byPattern[v.pattern]) byPattern[v.pattern] = [];
      byPattern[v.pattern].push(v.file);
    }
    
    for (const [pattern, files] of Object.entries(byPattern)) {
      console.log(`\n  ${pattern}:`);
      files.forEach(f => console.log(`    - ${f}`));
    }
    
    console.log('\n⚠️  Action required: Remove Google Fonts references and use local fonts instead.');
    console.log('   Example: Use next/font/local instead of next/font/google');
    process.exit(1);
  }
}

main();
