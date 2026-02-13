import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const healDir = path.join(root, 'artifacts', 'heals');
const patchDir = path.join(root, 'artifacts', 'patches');
const outputFile = path.join(root, 'artifacts', 'patches', 'unified_recovery_patch.txt');

async function listTxtFiles(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.txt') && entry.name !== path.basename(outputFile))
      .map((entry) => path.join(dir, entry.name))
      .sort((a, b) => path.basename(a).localeCompare(path.basename(b), undefined, { numeric: true }));
  } catch {
    return [];
  }
}

async function readSafe(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  return content.endsWith('\n') ? content : `${content}\n`;
}

async function main() {
  const healFiles = await listTxtFiles(healDir);
  const patchFiles = await listTxtFiles(patchDir);

  const sections = [];
  sections.push('# Unified Recovery Patch Bundle');
  sections.push('');
  sections.push(`Generated: ${new Date().toISOString()}`);
  sections.push(`Heal files merged: ${healFiles.length}`);
  sections.push(`Patch files merged: ${patchFiles.length}`);
  sections.push('');

  for (const filePath of [...healFiles, ...patchFiles]) {
    const rel = path.relative(root, filePath).replaceAll(path.sep, '/');
    const content = await readSafe(filePath);
    sections.push('='.repeat(100));
    sections.push(`SOURCE: ${rel}`);
    sections.push('-'.repeat(100));
    sections.push(content);
  }

  await fs.mkdir(path.dirname(outputFile), { recursive: true });
  await fs.writeFile(outputFile, sections.join('\n'), 'utf8');

  console.log(`Created ${path.relative(root, outputFile)} from ${healFiles.length + patchFiles.length} files.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
