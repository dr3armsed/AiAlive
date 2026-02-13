
export interface ProcessedFile {
    base64Data: string;
    mimeType: string;
    name: string;
    size: number;
}

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

/**
 * Processes a File object for API upload, converting it to a base64 string
 * and extracting relevant metadata. This Level-1000 function includes
 * robust validation for file size and type.
 *
 * @param file The File object from a file input.
 * @param options Optional configuration for processing.
 * @param options.maxSizeInBytes The maximum allowed file size. Defaults to 10MB.
 * @param options.allowedMimeTypes An array of allowed MIME types. If empty, all types are allowed.
 * @returns A Promise that resolves with a ProcessedFile object.
 * @throws An error if the file is too large, the MIME type is not allowed, or a read error occurs.
 */
export const processFileForUpload = (
    file: File,
    options: { maxSizeInBytes?: number; allowedMimeTypes?: string[] } = {}
): Promise<ProcessedFile> => new Promise((resolve, reject) => {
    const {
        maxSizeInBytes = MAX_FILE_SIZE_BYTES,
        allowedMimeTypes = [],
    } = options;

    // 1. Validate file size
    if (file.size > maxSizeInBytes) {
        return reject(new Error(`File "${file.name}" is too large. Maximum size is ${maxSizeInBytes / (1024 * 1024)}MB.`));
    }

    // 2. Validate MIME type
    if (allowedMimeTypes.length > 0 && !allowedMimeTypes.includes(file.type)) {
        return reject(new Error(`File type "${file.type}" is not allowed for "${file.name}".`));
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
        const result = reader.result as string;
        // The result is in format "data:mime/type;base64,ENCODED_DATA"
        const base64Data = result.split(',')[1];
        
        if (!base64Data) {
             return reject(new Error(`Failed to read and encode file "${file.name}".`));
        }

        resolve({
            base64Data,
            mimeType: file.type || 'application/octet-stream', // Fallback MIME type
            name: file.name,
            size: file.size,
        });
    };

    reader.onerror = () => {
        reject(new Error(`An error occurred while reading the file "${file.name}".`));
    };
});

/**
 * Generates a cryptographically secure SHA-256 hash for the given text content.
 * Used for unique identification of Egregore source material.
 * @param content The string content to hash.
 * @returns A hex string of the hash.
 */
export async function generateContentHash(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}
