import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { ensurePortableDirs, PORTABLE_PATHS } from './portable-config.mjs';

function checkCommand(command, args = ['--version']) {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  return {
    ok: result.status === 0,
    output: (result.stdout || result.stderr || '').trim(),
  };
}

function checkWritable(dir) {
  const probe = `${dir}/.write-test`;
  try {
    fs.writeFileSync(probe, 'ok', 'utf8');
    fs.unlinkSync(probe);
    return true;
  } catch {
    return false;
  }
}

ensurePortableDirs();

const nodeCheck = checkCommand('node');
const npmCheck = checkCommand('npm');
const pythonCheck = checkCommand('python3');

console.log('Portable doctor report');
console.log('----------------------');
console.log(`Node: ${nodeCheck.ok ? '✅' : '❌'} ${nodeCheck.output || 'not found'}`);
console.log(`npm: ${npmCheck.ok ? '✅' : '❌'} ${npmCheck.output || 'not found'}`);
console.log(`python3: ${pythonCheck.ok ? '✅' : '⚠️'} ${pythonCheck.output || 'not found (optional if bridge tests are skipped)'}`);
console.log('');
console.log('Writable portable directories:');
Object.values(PORTABLE_PATHS).forEach((dir) => {
  console.log(`${checkWritable(dir) ? '✅' : '❌'} ${dir}`);
});
