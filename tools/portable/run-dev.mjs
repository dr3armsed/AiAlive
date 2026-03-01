import { spawn } from 'node:child_process';
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

const child = spawn('npm', ['run', 'dev', '--', '--host', '0.0.0.0', '--port', '3000'], {
  stdio: 'inherit',
  env,
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
