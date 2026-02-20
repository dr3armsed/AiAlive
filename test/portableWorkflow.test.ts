import assert from 'assert';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';

function runPortableInitWithTempRoot() {
  const portableRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'genmeta-portable-root-'));
  const run = spawnSync('node', ['tools/portable/init.mjs'], {
    encoding: 'utf8',
    env: {
      ...process.env,
      GENMETA_PORTABLE_ROOT: portableRoot,
    },
  });

  assert.strictEqual(run.status, 0, run.stderr);

  const expectedDirs = [
    portableRoot,
    path.join(portableRoot, 'data'),
    path.join(portableRoot, 'logs'),
    path.join(portableRoot, 'cache'),
    path.join(portableRoot, 'cache', 'npm'),
    path.join(portableRoot, 'cache', 'python'),
  ];

  for (const dir of expectedDirs) {
    assert.ok(fs.existsSync(dir), `Expected directory to exist: ${dir}`);
  }

  const envPath = path.resolve('.env.portable');
  assert.ok(fs.existsSync(envPath), 'Expected .env.portable to be generated');

  const envContents = fs.readFileSync(envPath, 'utf8');
  assert.ok(envContents.includes(`GENMETA_PORTABLE_ROOT=${portableRoot}`));
  assert.ok(envContents.includes(`GENMETA_PORTABLE_DATA=${path.join(portableRoot, 'data')}`));
  assert.ok(envContents.includes(`NPM_CONFIG_CACHE=${path.join(portableRoot, 'cache', 'npm')}`));
}

function main() {
  runPortableInitWithTempRoot();
  console.log('Portable workflow tests passed.');
}

main();
