import { spawnSync } from 'node:child_process';
import { ensurePortableDirs, PORTABLE_PATHS } from './portable-config.mjs';

ensurePortableDirs();

const env = {
  ...process.env,
  GENMETA_PORTABLE_ROOT: PORTABLE_PATHS.root,
  GENMETA_PORTABLE_DATA: PORTABLE_PATHS.data,
  GENMETA_PORTABLE_LOGS: PORTABLE_PATHS.logs,
  GENMETA_PORTABLE_CACHE: PORTABLE_PATHS.cache,
  NPM_CONFIG_CACHE: PORTABLE_PATHS.npmCache,
  PYTHONPYCACHEPREFIX: PORTABLE_PATHS.pythonCache,
};

const checks = ['build', 'test:bridge', 'test:portable'];

for (const check of checks) {
  console.log(`\n▶ Running ${check} in portable mode...`);
  const result = spawnSync('npm', ['run', check], {
    stdio: 'inherit',
    env,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log('\n✅ Portable checks completed successfully.');
