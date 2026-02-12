import { promises as fs } from 'fs';
import path from 'path';
import { ArchitectureBlueprint } from '../config/architectureBlueprint';

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string');
}

function isBlueprintFileArray(value: unknown): value is ArchitectureBlueprint['files'] {
  return (
    Array.isArray(value) &&
    value.every(
      (entry) =>
        typeof entry === 'object' &&
        entry !== null &&
        typeof (entry as { path?: unknown }).path === 'string' &&
        typeof (entry as { content?: unknown }).content === 'string',
    )
  );
}

export async function loadArchitectureBlueprint(filePath: string): Promise<ArchitectureBlueprint> {
  const resolvedPath = path.resolve(filePath);
  const raw = await fs.readFile(resolvedPath, 'utf8');
  const parsed = JSON.parse(raw) as Partial<ArchitectureBlueprint>;

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Blueprint must be a JSON object.');
  }

  if (!isStringArray(parsed.directories)) {
    throw new Error('Blueprint.directories must be a string array.');
  }

  if (!isBlueprintFileArray(parsed.files)) {
    throw new Error('Blueprint.files must be an array of { path, content } objects.');
  }

  return {
    directories: Array.from(new Set(parsed.directories)),
    files: parsed.files,
  };
}
