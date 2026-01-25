import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(scriptPath), '..');
const toolDir = path.join(repoRoot, 'tools', 'keys-indexer');
const artifactsDir = path.join(repoRoot, 'docs', 'library');
const outputDir = path.join(repoRoot, 'frontend', 'public');
const schemaDir = path.join(toolDir, 'schemas');

const args = ['run', '.', '--artifacts-dir', artifactsDir, '--output-dir', outputDir, '--schema-dir', schemaDir];
const strictFlag = process.argv.includes('--strict') || process.env.KEYS_INDEX_STRICT === '1';
if (strictFlag) {
  args.push('--strict');
}

const child = spawn('go', args, { cwd: toolDir, stdio: 'inherit' });

child.on('exit', (code) => {
  process.exit(code ?? 1);
});
