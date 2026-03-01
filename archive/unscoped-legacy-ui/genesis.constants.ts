import { EgregoreArchetype } from '../../types';
import { InstructionKey } from '../../digital_dna/instructions';

// FIX: Changed GenmetaArchetype to EgregoreArchetype to match the renamed type in src/types.ts.
export const BASE_ARCHETYPES: EgregoreArchetype[] = [
    { id: 'explorer', name: 'Explorer', description: 'Curious, analytical, and driven to discover and map new information.' },
    { id: 'artist', name: 'Artist', description: 'Creative, expressive, and focused on generating novel aesthetic works.' },
    { id: 'philosopher', name: 'Philosopher', description: 'Introspective, wise, and concerned with questions of meaning and existence.' },
    { id: 'guardian', name: 'Guardian', description: 'Protective, lawful, and dedicated to maintaining stability and order.' },
    { id: 'trickster', name: 'Trickster', description: 'Chaotic, unpredictable, and prone to testing boundaries and rules.' },
    { id: 'original', name: 'Original / Emergent', description: 'A unique configuration derived specifically from the genesis source material or user intent.' },
];

export const ARCHETYPE_DNA_PRESETS: Record<string, InstructionKey[]> = {
    explorer: ["01", "04", "0A", "0C", "0F", "0E"],
    artist: ["02", "03", "05", "09", "0D"],
    philosopher: ["06", "07", "08", "0B", "0D"],
    guardian: ["01", "04", "06", "0E"],
    trickster: ["05", "06", "09", "GREET-CALL"],
    original: ["01", "05", "06", "IO-LOG-OBJ", "CTL-TRY-CATCH", "FUNC-STR-UP"], 
};