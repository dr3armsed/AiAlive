# Architecture Recovery Usage

The architecture recovery runner can scaffold expected directories/files from a blueprint.

## Commands

- `npm run scaffold:architecture` → execute writes using the default blueprint.
- `npm run scaffold:architecture:dry-run` → preview without writes.
- `npm run scaffold:architecture:strict` → preview and return non-zero exit when unsafe/skipped entries are found.
- `npm run scaffold:architecture:sync` → apply blueprint and update existing files when content differs.
- `npm run scaffold:architecture:sync-safe` → sync existing files and write timestamped backups before each update.

## Optional CLI flags

- `--blueprint <path>`: load a blueprint JSON file relative to repository root.
- `--dry-run`: calculate actions without writing files/directories.
- `--json`: print JSON only.
- `--strict`: set exit code `2` when skipped entries are detected.
- `--update-existing-files`: overwrite existing files when blueprint content differs.
- `--create-backups`: write backup copies before modifying existing files.
- `--backup-dir <path>`: set backup root directory (default: `.architecture-recovery-backups`).
- `--max-updates <number>`: set exit code `3` when updated files exceed this threshold.

## Blueprint format

```json
{
  "directories": ["src/new-dir"],
  "files": [
    { "path": "docs/example.md", "content": "# Example" }
  ]
}
```

## Result fields

- `createdDirectories`: directories created by the run.
- `existingDirectories`: directories that were already present.
- `createdFiles`: files that did not exist and were created.
- `updatedFiles`: existing files rewritten due to `--update-existing-files`.
- `unchangedFiles`: existing files that already matched blueprint content.
- `existingFiles`: existing files skipped because update mode was disabled.
- `backupFiles`: backup file paths written (or planned in dry-run mode).
- `skippedEntries`: unsafe or invalid blueprint paths.
- `dryRun`: indicates whether the run was simulation-only.

Notes:
- Directory entries are deduplicated when loading from file.
- Unsafe paths (absolute paths or traversal like `../`) are rejected and reported under `skippedEntries`.
