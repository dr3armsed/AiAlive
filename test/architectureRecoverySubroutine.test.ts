import assert from 'assert';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { ArchitectureRecoverySubroutine } from '../src/subroutines/architectureRecoverySubroutine';
import { ArchitectureBlueprint } from '../src/config/architectureBlueprint';
import { loadArchitectureBlueprint } from '../src/subroutines/loadArchitectureBlueprint';

async function withTempDir(run: (rootDir: string) => Promise<void>) {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'aialive-recovery-'));
  try {
    await run(tempRoot);
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
}

async function testCreateAndSkipUnsafePaths() {
  await withTempDir(async (rootDir) => {
    const blueprint: ArchitectureBlueprint = {
      directories: ['src/new-feature', '../escape'],
      files: [
        { path: 'docs/notes.md', content: '# Notes' },
        { path: '../../outside.md', content: 'nope' },
      ],
    };

    const subroutine = new ArchitectureRecoverySubroutine(rootDir);
    const result = await subroutine.execute(blueprint, { writeMode: true });

    assert.deepStrictEqual(result.createdDirectories, ['src/new-feature']);
    assert.deepStrictEqual(result.createdFiles, ['docs/notes.md']);
    assert.deepStrictEqual(result.skippedEntries.sort(), ['../../outside.md', '../escape'].sort());

    const createdDir = await fs.stat(path.join(rootDir, 'src/new-feature'));
    assert.ok(createdDir.isDirectory());

    const createdFile = await fs.readFile(path.join(rootDir, 'docs/notes.md'), 'utf8');
    assert.strictEqual(createdFile, '# Notes');
  });
}

async function testDryRunDoesNotWrite() {
  await withTempDir(async (rootDir) => {
    const blueprint: ArchitectureBlueprint = {
      directories: ['src/dry-run-only'],
      files: [{ path: 'docs/dry-run.md', content: 'dry run' }],
    };

    const subroutine = new ArchitectureRecoverySubroutine(rootDir);
    const result = await subroutine.execute(blueprint, { writeMode: false });

    assert.strictEqual(result.dryRun, true);
    assert.deepStrictEqual(result.createdDirectories, ['src/dry-run-only']);
    assert.deepStrictEqual(result.createdFiles, ['docs/dry-run.md']);

    await assert.rejects(fs.stat(path.join(rootDir, 'src/dry-run-only')));
    await assert.rejects(fs.stat(path.join(rootDir, 'docs/dry-run.md')));
  });
}

async function testUpdateExistingFilesBehavior() {
  await withTempDir(async (rootDir) => {
    const targetFile = path.join(rootDir, 'docs/state.md');
    await fs.mkdir(path.dirname(targetFile), { recursive: true });
    await fs.writeFile(targetFile, 'old', 'utf8');

    const blueprint: ArchitectureBlueprint = {
      directories: [],
      files: [{ path: 'docs/state.md', content: 'new' }],
    };

    const subroutine = new ArchitectureRecoverySubroutine(rootDir);

    const noUpdate = await subroutine.execute(blueprint, { writeMode: true, updateExistingFiles: false });
    assert.deepStrictEqual(noUpdate.existingFiles, ['docs/state.md']);
    assert.deepStrictEqual(noUpdate.updatedFiles, []);
    assert.strictEqual(await fs.readFile(targetFile, 'utf8'), 'old');

    const withUpdate = await subroutine.execute(blueprint, { writeMode: true, updateExistingFiles: true });
    assert.deepStrictEqual(withUpdate.updatedFiles, ['docs/state.md']);
    assert.strictEqual(await fs.readFile(targetFile, 'utf8'), 'new');

    const sameContent = await subroutine.execute(blueprint, { writeMode: true, updateExistingFiles: true });
    assert.deepStrictEqual(sameContent.unchangedFiles, ['docs/state.md']);
  });
}

async function testBackupCreationForUpdatedFiles() {
  await withTempDir(async (rootDir) => {
    const targetFile = path.join(rootDir, 'docs/original.md');
    await fs.mkdir(path.dirname(targetFile), { recursive: true });
    await fs.writeFile(targetFile, 'legacy', 'utf8');

    const blueprint: ArchitectureBlueprint = {
      directories: [],
      files: [{ path: 'docs/original.md', content: 'modernized' }],
    };

    const subroutine = new ArchitectureRecoverySubroutine(rootDir);
    const result = await subroutine.execute(blueprint, {
      writeMode: true,
      updateExistingFiles: true,
      createBackups: true,
      backupDirName: '.backup-tests',
    });

    assert.strictEqual(result.updatedFiles.length, 1);
    assert.strictEqual(result.backupFiles.length, 1);
    assert.ok(result.backupFiles[0].startsWith('.backup-tests/'));

    const backupContent = await fs.readFile(path.join(rootDir, result.backupFiles[0]), 'utf8');
    assert.strictEqual(backupContent, 'legacy');
  });
}

async function testLoadArchitectureBlueprintValidation() {
  await withTempDir(async (rootDir) => {
    const validPath = path.join(rootDir, 'valid-blueprint.json');
    await fs.writeFile(
      validPath,
      JSON.stringify({
        directories: ['src/a', 'src/a', 'src/b'],
        files: [{ path: 'docs/a.md', content: 'A' }],
      }),
      'utf8',
    );

    const blueprint = await loadArchitectureBlueprint(validPath);
    assert.deepStrictEqual(blueprint.directories, ['src/a', 'src/b']);
    assert.deepStrictEqual(blueprint.files, [{ path: 'docs/a.md', content: 'A' }]);

    const invalidPath = path.join(rootDir, 'invalid-blueprint.json');
    await fs.writeFile(
      invalidPath,
      JSON.stringify({
        directories: ['src/a'],
        files: [{ path: 'docs/a.md' }],
      }),
      'utf8',
    );

    await assert.rejects(loadArchitectureBlueprint(invalidPath));
  });
}

async function main() {
  await testCreateAndSkipUnsafePaths();
  await testDryRunDoesNotWrite();
  await testUpdateExistingFilesBehavior();
  await testBackupCreationForUpdatedFiles();
  await testLoadArchitectureBlueprintValidation();
  console.log('ArchitectureRecoverySubroutine tests passed.');
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
