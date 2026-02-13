export interface BlueprintFile {
  path: string;
  content: string;
}

export interface ArchitectureBlueprint {
  directories: string[];
  files: BlueprintFile[];
}

/**
 * Conservative default blueprint.
 *
 * Keeps scaffolding focused on directory structure only so the routine can be
 * safely used in existing projects without creating placeholder docs by default.
 */
export const defaultArchitectureBlueprint: ArchitectureBlueprint = {
  directories: [
    'docs/architecture',
    'docs/operations',
    'docs/product',
    'src/core',
    'src/cognition',
    'src/emotion',
    'src/biology',
    'src/agent',
    'src/systems',
    'src/models',
    'src/entry',
    'src/subroutines',
    'data',
    'artifacts/archive',
  ],
  files: [],
};
