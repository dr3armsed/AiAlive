import { promises as fs } from 'fs';
import path from 'path';
import { ArchitectureBlueprint } from '../config/architectureBlueprint';

export interface RecoveryExecutionOptions {
  writeMode?: boolean;
  updateExistingFiles?: boolean;
  createBackups?: boolean;
  backupDirName?: string;
}

export interface RecoveryResult {
  createdDirectories: string[];
  existingDirectories: string[];
  createdFiles: string[];
  updatedFiles: string[];
  unchangedFiles: string[];
  existingFiles: string[];
  backupFiles: string[];
  skippedEntries: string[];
  dryRun: boolean;
}

export class ArchitectureRecoverySubroutine {
  constructor(private readonly rootDir: string) {}

  async execute(blueprint: ArchitectureBlueprint, options: RecoveryExecutionOptions = {}): Promise<RecoveryResult> {
    const writeMode = options.writeMode ?? true;
    const updateExistingFiles = options.updateExistingFiles ?? false;
    const createBackups = options.createBackups ?? false;
    const backupDirName = options.backupDirName ?? '.architecture-recovery-backups';

    const result: RecoveryResult = {
      createdDirectories: [],
      existingDirectories: [],
      createdFiles: [],
      updatedFiles: [],
      unchangedFiles: [],
      existingFiles: [],
      backupFiles: [],
      skippedEntries: [],
      dryRun: !writeMode,
    };

    for (const rawDir of blueprint.directories) {
      const dir = this.normalizeRelativePath(rawDir);
      if (!dir) {
        result.skippedEntries.push(rawDir);
        continue;
      }

      const target = path.join(this.rootDir, dir);
      const exists = await this.pathExists(target);

      if (exists) {
        result.existingDirectories.push(dir);
        continue;
      }

      if (writeMode) {
        await fs.mkdir(target, { recursive: true });
      }
      result.createdDirectories.push(dir);
    }

    for (const fileDef of blueprint.files) {
      const safeFilePath = this.normalizeRelativePath(fileDef.path);
      if (!safeFilePath) {
        result.skippedEntries.push(fileDef.path);
        continue;
      }

      const target = path.join(this.rootDir, safeFilePath);
      const exists = await this.pathExists(target);

      if (!exists) {
        if (writeMode) {
          await fs.mkdir(path.dirname(target), { recursive: true });
          await fs.writeFile(target, fileDef.content, 'utf8');
        }
        result.createdFiles.push(safeFilePath);
        continue;
      }

      if (!updateExistingFiles) {
        result.existingFiles.push(safeFilePath);
        continue;
      }

      const currentContent = await fs.readFile(target, 'utf8');
      if (currentContent === fileDef.content) {
        result.unchangedFiles.push(safeFilePath);
        continue;
      }

      if (createBackups) {
        const backupPath = this.buildBackupPath(backupDirName, safeFilePath);
        if (writeMode) {
          const absoluteBackupPath = path.join(this.rootDir, backupPath);
          await fs.mkdir(path.dirname(absoluteBackupPath), { recursive: true });
          await fs.writeFile(absoluteBackupPath, currentContent, 'utf8');
        }
        result.backupFiles.push(backupPath);
      }

      if (writeMode) {
        await fs.writeFile(target, fileDef.content, 'utf8');
      }
      result.updatedFiles.push(safeFilePath);
    }

    return result;
  }

  private buildBackupPath(backupDirName: string, safeFilePath: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return path.posix.join(backupDirName, timestamp, safeFilePath);
  }

  private normalizeRelativePath(inputPath: string): string | null {
    const normalized = path.posix.normalize(inputPath.replace(/\\/g, '/')).replace(/^\.\//, '');

    if (!normalized || normalized === '.' || normalized.startsWith('../') || normalized.includes('/../')) {
      return null;
    }

    if (path.posix.isAbsolute(normalized)) {
      return null;
    }

    return normalized;
  }

  private async pathExists(target: string): Promise<boolean> {
    try {
      await fs.access(target);
      return true;
    } catch {
      return false;
    }
  }
}
