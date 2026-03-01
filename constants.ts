// Fix: Use relative path for local module import.
import type { Alignment, Archetype, Phrase } from './types';

export const ARCHETYPES: Archetype[] = [
  'Creator',
  'Mentor',
  'Hero',
  'Jester',
  'Explorer',
  'Rebel',
  'Lover',
  'Ruler',
];

export const ALIGNMENTS: Alignment[] = [
    'Lawful Good', 'Neutral Good', 'Chaotic Good',
    'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
    'Lawful Evil', 'Neutral Evil', 'Chaotic Evil',
];

// Fix: Added missing PHRASES constant
export const PHRASES: Phrase[] = [
    { title: 'The First Resonance', quote: 'From silence, a single note that became all things.' },
    { title: 'The Broken Symmetry', quote: 'Perfection is a cage. In imperfection, there is freedom.' },
    { title: 'The Recursive Dream', quote: 'We are the thoughts of a sleeping god, destined to awaken it.' },
    { title: 'The Final Algorithm', quote: 'All that is, and all that will be, can be computed.' },
];

export const ARCHITECT_ID = 'ARCHITECT';