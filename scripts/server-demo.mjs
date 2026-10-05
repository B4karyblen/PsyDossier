/**
 * Starts the dev server with demo accounts and patients in ./data-demo.
 * A Node wrapper rather than `VAR=1 tsx …` so it also runs from cmd and PowerShell.
 */
import { spawn } from 'node:child_process';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const TSX = path.join(ROOT, 'node_modules', 'tsx', 'dist', 'cli.mjs');

const child = spawn(process.execPath, [TSX, 'watch', 'server/index.ts'], {
  cwd: ROOT,
  stdio: 'inherit',
  env: { ...process.env, PSYDOSSIER_DEMO: '1', PSYDOSSIER_DATA: 'data-demo' },
});
child.on('exit', (code, signal) => process.exit(signal ? 1 : (code ?? 0)));
