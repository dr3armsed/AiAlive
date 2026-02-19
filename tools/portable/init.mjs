import { ensurePortableDirs, PORTABLE_PATHS, writePortableEnvFile } from './portable-config.mjs';

ensurePortableDirs();
const envPath = writePortableEnvFile();

console.log('✅ Portable runtime directories are ready.');
console.log(`Portable root: ${PORTABLE_PATHS.root}`);
console.log(`Env file written: ${envPath}`);
console.log('Run `npm run portable:doctor` next to verify the setup.');
