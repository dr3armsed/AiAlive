
/**
 * Calculates a simple, non-cryptographic hash of a string.
 * This is used for quick integrity checks and versioning of DNA code blocks.
 *
 * @param str The string to hash.
 * @returns A hexadecimal hash string.
 */
export const simpleHash = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
};
