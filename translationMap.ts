/**
 * UNIVERSAL TRANSLATOR & CHARACTER MAP
 *
 * This file documents character mappings to prevent confusion from homoglyphs
 * (characters that look similar but are different). The primary goal is to ensure
 * code clarity and prevent bugs arising from deceptive characters.
 *
 * In previous versions, Cyrillic characters that resembled Latin characters were used.
 * This has been standardized to use Latin characters exclusively in the codebase.
 */

export const characterHomoglyphMap = new Map<string, { latinEquivalent: string, unicode: string, description: string }>([
    [
        'Д',
        {
            latinEquivalent: 'D',
            unicode: 'U+0414',
            description: "Cyrillic Capital Letter De. Previously used in type names like 'ДднаTerm'. Standardized to 'DnaTerm'."
        }
    ],
    // Add other mappings here as they are discovered.
]);
