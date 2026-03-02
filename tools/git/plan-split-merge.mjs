#!/usr/bin/env node
import { execSync } from 'node:child_process';

const commit = process.argv[2] ?? 'HEAD';

const scopes = [
  { name: 'portable-docs', prefixes: ['docs/operations/', 'tools/portable/', '.gitignore', 'package.json'] },
  { name: 'python-runtime-bridge', prefixes: ['scripts/python/'] },
  { name: 'runtime-services', prefixes: ['src/runtime/services/', 'src/runtime/hooks/useMetacosmRuntime.ts', 'src/runtime/types.ts'] },
  { name: 'runtime-ui', prefixes: ['src/App.tsx', 'src/common.tsx', 'src/runtime/components/'] },
  { name: 'planning-and-potentials', prefixes: ['Unknown/', 'Potentials/'] },
  { name: 'tests', prefixes: ['test/'] },
  { name: 'integration-misc', prefixes: ['index.html', 'src/integrations/', 'src/entry/', 'artifacts/patches/', 'archive/', 'src/biology/'] }
];

function getFiles(targetCommit) {
  const output = execSync(`git show --name-only --pretty=format: ${targetCommit}`, { encoding: 'utf8' });
  return output.split('\n').map((line) => line.trim()).filter(Boolean);
}

function matchScope(file) {
  for (const scope of scopes) {
    if (scope.prefixes.some((prefix) => file === prefix || file.startsWith(prefix))) {
      return scope.name;
    }
  }
  return 'unmapped';
}

const files = getFiles(commit);
const grouped = new Map();
for (const file of files) {
  const scope = matchScope(file);
  if (!grouped.has(scope)) grouped.set(scope, []);
  grouped.get(scope).push(file);
}

console.log(`# Split Merge Plan for ${commit}`);
console.log('');
console.log('Use this when the full merge is rejected as too complex. Create smaller PRs by scope.');
console.log('');

for (const [scope, scopeFiles] of grouped.entries()) {
  console.log(`## ${scope}`);
  console.log('');
  for (const file of scopeFiles) {
    console.log(`- ${file}`);
  }
  console.log('');
}

console.log('## Suggested execution');
console.log('');
console.log('1. `git checkout main && git pull`');
console.log('2. For each scope above:');
console.log('   - `git checkout -b split/<scope>`');
console.log(`   - \
\`git checkout ${commit} -- <scope-file-1> <scope-file-2> ...\``);
console.log('   - `git commit -m "<scope>: extract from large integration commit"`');
console.log('   - Open PR and merge in dependency order: portable/docs -> python bridge -> services -> UI -> tests.');
