import { TYPES } from '../creationTypes';

// Basic field definition used by the legacy CreationsView form builder
export interface FieldDef {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'number' | 'select' | 'repeatable_group' | string;
    placeholder?: string;
    defaultValue?: any;
    options?: string[];
    min?: number;
    max?: number;
    subFields?: FieldDef[];
}

export interface CreationDef {
    id: string;
    label: string;
    description: string;
    fields: FieldDef[];
}

// Generate a minimal set of definitions from the creation types registry.
export const CREATION_DEFINITIONS: CreationDef[] = TYPES.map((typeModule: any) => ({
    id: typeModule.TYPE.replace(/\s+/g, '-').toLowerCase(),
    label: typeModule.TYPE,
    description: typeModule.DESCRIPTION || '',
    fields: [] // legacy UI didn't maintain any dynamic fields for each type
}));

export { CREATION_DEFINITIONS, CreationDef, FieldDef };