import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const hasStrict = args.includes('--strict');
const hasOutput = args.includes('--output');
const hasFormat = args.includes('--format');

if (!hasStrict && process.env.CI === 'true') {
  args.push('--strict');
}

if (!hasOutput) {
  args.push('--output', path.join(repoRoot, 'frontend', 'public', 'validation_report.json'));
}

if (!hasFormat) {
  args.push('--format', 'json');
}

const candidates = [
  path.join(repoRoot, 'target', 'release', 'keys-validate'),
  path.join(repoRoot, 'target', 'debug', 'keys-validate'),
];

const binary = candidates.find((candidate) => existsSync(candidate));

let result;
if (binary) {
  result = spawnSync(binary, args, { stdio: 'inherit' });
} else {
  result = spawnSync('cargo', ['run', '-p', 'keys-validate', '--', ...args], {
    stdio: 'inherit',
  });
}

process.exit(result.status ?? 1);
