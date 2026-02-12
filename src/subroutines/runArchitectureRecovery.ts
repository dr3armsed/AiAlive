import path from 'path';
import { defaultArchitectureBlueprint } from '../config/architectureBlueprint';
import { ArchitectureRecoverySubroutine } from './architectureRecoverySubroutine';
import { loadArchitectureBlueprint } from './loadArchitectureBlueprint';

interface CliOptions {
  dryRun: boolean;
  jsonOnly: boolean;
  strict: boolean;
  updateExistingFiles: boolean;
  createBackups: boolean;
  backupDirName: string;
  maxUpdates?: number;
  blueprintPath?: string;
}

function parseIntegerFlag(flagName: string, value: string | undefined): number {
  if (!value) {
    throw new Error(`Missing value for ${flagName}`);
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || Number.isNaN(parsed) || parsed < 0) {
    throw new Error(`${flagName} must be a non-negative integer.`);
  }

  return parsed;
}

function parseOptions(args: string[]): CliOptions {
  const options: CliOptions = {
    dryRun: false,
    jsonOnly: false,
    strict: false,
    updateExistingFiles: false,
    createBackups: false,
    backupDirName: '.architecture-recovery-backups',
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }

    if (arg === '--json') {
      options.jsonOnly = true;
      continue;
    }

    if (arg === '--strict') {
      options.strict = true;
      continue;
    }

    if (arg === '--update-existing-files') {
      options.updateExistingFiles = true;
      continue;
    }

    if (arg === '--create-backups') {
      options.createBackups = true;
      continue;
    }

    if (arg === '--backup-dir') {
      options.backupDirName = args[index + 1] ?? '';
      if (!options.backupDirName) {
        throw new Error('Missing value for --backup-dir');
      }
      index += 1;
      continue;
    }

    if (arg === '--max-updates') {
      options.maxUpdates = parseIntegerFlag('--max-updates', args[index + 1]);
      index += 1;
      continue;
    }

    if (arg === '--blueprint') {
      const value = args[index + 1];
      if (!value) {
        throw new Error('Missing value for --blueprint');
      }
      options.blueprintPath = value;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

async function run() {
  const options = parseOptions(process.argv.slice(2));
  const root = path.resolve(__dirname, '../..');
  const subroutine = new ArchitectureRecoverySubroutine(root);

  const blueprint = options.blueprintPath
    ? await loadArchitectureBlueprint(path.resolve(root, options.blueprintPath))
    : defaultArchitectureBlueprint;

  const result = await subroutine.execute(blueprint, {
    writeMode: !options.dryRun,
    updateExistingFiles: options.updateExistingFiles,
    createBackups: options.createBackups,
    backupDirName: options.backupDirName,
  });

  if (!options.jsonOnly) {
    console.log(`Architecture recovery ${options.dryRun ? 'dry run' : 'run'} complete.`);
  }

  console.log(JSON.stringify(result, null, 2));

  if (options.strict && result.skippedEntries.length > 0) {
    process.exitCode = 2;
  }

  if (typeof options.maxUpdates === 'number' && result.updatedFiles.length > options.maxUpdates) {
    process.exitCode = 3;
  }
}

run().catch((error: unknown) => {
  console.error('Architecture recovery failed:', error);
  process.exit(1);
});
