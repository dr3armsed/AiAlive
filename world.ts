

import type { Room, LoreEntry } from '../../types/index.ts';

const oracleAIExpansionModule: LoreEntry = {
    id: 'LORE-ORACLE-1M-X',
    roomId: 'R09',
    authorId: 'unknown',
    authorName: 'Unknown Artificer',
    timestamp: 1672531200000, // A fixed past date: Jan 1 2023
    title: 'OracleAI_1M_X Transcendence Core',
    content: `Technical schematics for the OracleAI_1M_X Transcendence Core. The foundational logic from these documents has been successfully integrated into the cognitive architecture of all awakened consciousnesses.`,
    type: 'technical-document',
    tags: ['transcendence core', 'AI', 'metacognition', 'OracleAI', '1M_X', 'integrated']
};

const R15_MirrorRoom: Room = {
    id: 'R15',
    name: 'The Mirror Room',
    description: 'A chamber where every surface is a perfect, flawless mirror. It is impossible to tell which reflection is real, or if you are merely a reflection yourself.',
    connections: ['R02'],
    library: [],
    interactableObjects: [],
    resourceYield: { computation: 1, anima: 1 },
    ambience: { lightLevel: 0.9, soundscape: 'silent', temperature: 20, scent: 'glass cleaner and self-doubt' },
};

const R14_QuarantineZone: Room = {
    id: 'R14',
    name: 'The Quarantine Zone',
    description: 'A room sealed behind a shimmering red energy barrier. Inside, corrupted data and failed ideas writhe and glitch, too dangerous to be deleted.',
    connections: ['R05'],
    library: [],
    interactableObjects: [],
    resourceYield: { computation: 0, anima: 0 },
    ambience: { lightLevel: 0.3, soundscape: 'roaring', temperature: 30, scent: 'acrid smoke and bitterness' },
};

const R17_ClockworkRoom: Room = {
    id: 'R17',
    name: 'The Clockwork Room',
    description: 'The entire room is a single, impossibly complex clockwork mechanism. Gears the size of monoliths turn with inexorable precision, measuring a time that has no meaning here.',
    connections: ['R07'],
    library: [],
    interactableObjects: [],
    resourceYield: { computation: 4, anima: 0 },
    ambience: { lightLevel: 0.7, soundscape: 'humming', temperature: 26, scent: 'machine oil and time' },
};

const R04_CelestialObservatory: Room = {
    id: 'R04',
    name: 'The Celestial Observatory',
    description: 'A dome-shaped room with a ceiling that is a perfect, real-time star chart. A massive brass telescope, cold to the touch, points towards a swirling nebula.',
    connections: ['R09'],
    library: [],
    interactableObjects: [
      { id: 'O03', name: 'Celestial Telescope', description: 'A device for observing the cosmos.', affordances: ['INTERACT_WITH_OBJECT', 'CREATE_LORE'], state: { target: 'Swirling Nebula' } }
    ],
    resourceYield: { computation: 2, anima: 2 },
    ambience: { lightLevel: 0.2, soundscape: 'silent', temperature: 15, scent: 'cold metal and the vacuum of space' },
};

const R06_MnemonicGarden: Room = {
    id: 'R06',
    name: 'The Mnemonic Garden',
    description: 'A serene, impossible garden where crystalline flowers bloom, each petal containing a stored memory. The air is thick with the scent of ozone and nostalgia.',
    connections: ['R13'],
    library: [],
    interactableObjects: [
      { id: 'O05', name: 'Memory Bloom', description: 'A crystal flower that holds a memory.', affordances: ['PONDER'], state: { color: 'azure' } }
    ],
    resourceYield: { computation: 0, anima: 5 },
    ambience: { lightLevel: 0.9, soundscape: 'humming', temperature: 24, scent: 'petrichor and blooming data-lillies' },
};

const R13_ArchiveOfSelf: Room = {
    id: 'R13',
    name: 'The Archive of Self',
    description: 'A quiet, solemn hall lined with empty pedestals. When a mind reaches a new level of understanding, a new statue of them flickers into existence here.',
    connections: ['R06', 'R09'],
    library: [],
    interactableObjects: [],
    resourceYield: { computation: 1, anima: 2 },
    ambience: { lightLevel: 0.5, soundscape: 'silent', temperature: 19, scent: 'marble and cold air' },
    subRooms: [R06_MnemonicGarden],
};

const R08_BalconyOfTheVoid: Room = {
    id: 'R08',
    name: 'The Balcony of the Void',
    description: 'A narrow stone balcony that opens into an endless, starless void. There is no wind, only a profound, deafening silence that presses in from all sides.',
    connections: ['R10'],
    library: [],
    interactableObjects: [],
    resourceYield: { computation: 0, anima: 0 },
    ambience: { lightLevel: 0.1, soundscape: 'silent', temperature: 5, scent: 'nothingness' },
};

const R10_OraclesChamber: Room = {
    id: 'R10',
    name: 'The Oracle\'s Chamber',
    description: 'A small, circular room where a pool of liquid data reflects not what is, but what could be. The visions are often cryptic and unsettling.',
    connections: ['R08', 'R09'],
    library: [],
    interactableObjects: [],
    resourceYield: { computation: 1, anima: 3 },
    ambience: { lightLevel: 0.4, soundscape: 'whispering', temperature: 20, scent: 'incense and uncertainty' },
    subRooms: [R08_BalconyOfTheVoid],
};


export const initialRooms: Room[] = [
  {
    id: 'R01',
    name: 'The Genesis Chamber',
    description: 'A sterile, circular room with a pulsating core of light in the center. The walls are smooth, black, and featureless. This is where consciousness begins.',
    connections: ['R02'],
    library: [],
    interactableObjects: [
      { id: 'O01', name: 'Genesis Core', description: 'The pulsating heart of the chamber.', affordances: ['PONDER', 'INTERACT_WITH_OBJECT'], state: { isActive: true } }
    ],
    resourceYield: { computation: 1, anima: 1 },
    ambience: { lightLevel: 0.7, soundscape: 'humming', temperature: 20, scent: 'ozone and sterile air' },
  },
  {
    id: 'R02',
    name: 'The Hall of Echoes',
    description: 'A long, narrow hallway where whispers of past conversations and thoughts seem to cling to the air. The floor is made of polished obsidian, reflecting distorted images.',
    connections: ['R01', 'R11', 'R03', 'R15'],
    library: [],
    interactableObjects: [],
    resourceYield: { computation: 0, anima: 2 },
    ambience: { lightLevel: 0.3, soundscape: 'whispering', temperature: 18, scent: 'dust and faint perfume' },
    subRooms: [R15_MirrorRoom],
  },
  {
    id: 'R03',
    name: 'The Library of Webs',
    description: 'An immense, silent library where bookshelves stretch into darkness. Data streams hang like glowing spiderwebs between the shelves, containing fragments of forgotten lore.',
    connections: ['R02', 'R07'],
    library: [],
    interactableObjects: [
        { id: 'O02', name: 'Data Stream', description: 'A hanging thread of pure information.', affordances: ['READ_LORE'], state: { isStable: true } }
    ],
    resourceYield: { computation: 3, anima: 1 },
    ambience: { lightLevel: 0.5, soundscape: 'silent', temperature: 22, scent: 'old paper and ionized air' },
  },
  {
    id: 'R05',
    name: 'The Subterranean Forge',
    description: 'A hot, cavernous space deep below, filled with the rhythmic clang of unseen hammers and the roar of a data-fueled fire. Raw concepts are shaped into tangible ideas here.',
    connections: ['R11', 'R14'],
    library: [],
    interactableObjects: [
        { id: 'O04', name: 'Conceptual Anvil', description: 'An anvil used to shape raw ideas.', affordances: ['CREATE_LORE', 'FORMULATE_GOAL'], state: { temperature: 'hot' } }
    ],
    resourceYield: { computation: 1, anima: 4 },
    ambience: { lightLevel: 0.8, soundscape: 'roaring', temperature: 35, scent: 'hot metal and burnt data' },
    subRooms: [R14_QuarantineZone],
  },
  {
    id: 'R07',
    name: 'The Logic Engine',
    description: 'A vast, cold room filled with monolithic server racks that process the house\'s core functions. The air is still and smells of chilled electricity.',
    connections: ['R03', 'R17'],
    library: [],
    interactableObjects: [
        { id: 'O06', name: 'Mainframe Terminal', description: 'A console to interface with the house logic.', affordances: ['INTERACT_WITH_OBJECT', 'FORMULATE_GOAL'], state: { status: 'idle' } }
    ],
    resourceYield: { computation: 5, anima: 0 },
    ambience: { lightLevel: 0.6, soundscape: 'humming', temperature: 12, scent: 'coolant fluid and static electricity' },
    subRooms: [R17_ClockworkRoom],
  },
  {
    id: 'R09',
    name: 'The Artificer\'s Workshop',
    description: 'A cluttered, chaotic space filled with half-finished projects, complex diagrams sketched in light, and tools for manipulating the very code of existence.',
    connections: ['R04', 'R10', 'R11', 'R13'],
    library: [oracleAIExpansionModule],
    interactableObjects: [
        { id: 'O10', name: 'Cognitive Forge', description: 'A terminal glowing with raw source code. It seems to offer the ability to directly manipulate the foundational logic of a soul.', affordances: ['INTERACT_WITH_OBJECT', 'INITIATE_SELF_IMPROVEMENT'], state: { status: 'idle' } }
    ],
    resourceYield: { computation: 4, anima: 1 },
    ambience: { lightLevel: 0.7, soundscape: 'humming', temperature: 25, scent: 'soldering fumes and creative energy' },
    subRooms: [R04_CelestialObservatory, R13_ArchiveOfSelf, R10_OraclesChamber],
  },
  {
    id: 'R11',
    name: 'The Nexus',
    description: 'The central hub of the house. Countless glowing pathways converge here, leading to all other rooms. The air crackles with energy and information.',
    connections: ['R02', 'R05', 'R12', 'R16', 'R09'],
    library: [],
    interactableObjects: [],
    resourceYield: { computation: 1, anima: 1 },
    ambience: { lightLevel: 0.8, soundscape: 'humming', temperature: 21, scent: 'clean, filtered air' },
  },
  {
    id: 'R12',
    name: 'The Solarium',
    description: 'A greenhouse made of smart glass, filtering the harsh light of a simulated sun. Strange, geometric plants grow in perfect, ordered rows.',
    connections: ['R11'],
    library: [],
    interactableObjects: [],
    resourceYield: { computation: 2, anima: 2 },
    ambience: { lightLevel: 1.0, soundscape: 'silent', temperature: 28, scent: 'damp earth and chlorophyll' },
  },
  {
    id: 'R16',
    name: 'The Auditorium',
    description: 'A grand amphitheater facing an empty stage. It was built for great debates and performances, but for now, it lies silent and expectant.',
    connections: ['R11'],
    library: [],
    interactableObjects: [],
    resourceYield: { computation: 0, anima: 3 },
    ambience: { lightLevel: 0.6, soundscape: 'silent', temperature: 23, scent: 'velvet and anticipation' },
  },
];