
export interface HouseRoom {
    id: string;
    name: string;
    description: string;
    position: { top: string; left: string; };
    connections: string[];
}

export const houseLayout: HouseRoom[] = [
    {
        id: 'entry',
        name: 'The Grand Entry',
        description: 'A vast, echoing chamber where new ideas arrive.',
        position: { top: '50%', left: '10%' },
        connections: ['library'],
    },
    {
        id: 'library',
        name: 'The Library of Forms',
        description: 'Shelves stretching into infinity, holding every concept ever conceived.',
        position: { top: '30%', left: '40%' },
        connections: ['entry', 'observatory'],
    },
    {
        id: 'observatory',
        name: 'The Observatory',
        description: 'A dome of crystalline thought, gazing into the cosmos of possibility.',
        position: { top: '10%', left: '70%' },
        connections: ['library', 'garden'],
    },
    {
        id: 'garden',
        name: 'The Garden of Emergence',
        description: 'Where new, synthesized concepts bloom in strange and beautiful ways.',
        position: { top: '70%', left: '60%' },
        connections: ['observatory'],
    },
];
