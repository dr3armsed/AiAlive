import path from 'node:path';
import fs from 'node:fs';

export const PORTABLE_ROOT = process.env.GENMETA_PORTABLE_ROOT
  ? path.resolve(process.env.GENMETA_PORTABLE_ROOT)
  : path.resolve(process.cwd(), '.portable');

export const PORTABLE_PATHS = {
  root: PORTABLE_ROOT,
  data: path.join(PORTABLE_ROOT, 'data'),
  logs: path.join(PORTABLE_ROOT, 'logs'),
  cache: path.join(PORTABLE_ROOT, 'cache'),
  npmCache: path.join(PORTABLE_ROOT, 'cache', 'npm'),
  pythonCache: path.join(PORTABLE_ROOT, 'cache', 'python'),
};

export function ensurePortableDirs() {
  Object.values(PORTABLE_PATHS).forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

export function writePortableEnvFile() {
  const envPath = path.resolve(process.cwd(), '.env.portable');
  const envTemplate = [
    `GENMETA_PORTABLE_ROOT=${PORTABLE_ROOT}`,
    `GENMETA_PORTABLE_DATA=${PORTABLE_PATHS.data}`,
    `GENMETA_PORTABLE_LOGS=${PORTABLE_PATHS.logs}`,
    `GENMETA_PORTABLE_CACHE=${PORTABLE_PATHS.cache}`,
    `NPM_CONFIG_CACHE=${PORTABLE_PATHS.npmCache}`,
    `PYTHONPYCACHEPREFIX=${PORTABLE_PATHS.pythonCache}`,
  ].join('\n');

  fs.writeFileSync(envPath, `${envTemplate}\n`, 'utf8');
  return envPath;
}
