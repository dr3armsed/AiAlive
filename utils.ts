export const generateUUID = (): string => crypto.randomUUID();

export const formatFileSize = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const isObject = (item: any): item is Record<string, any> => (item && typeof item === 'object' && !Array.isArray(item));

export const mergeDeep = (target: any, source: any): any => {
    const output = { ...target };
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            const sourceValue = source[key];
            if (sourceValue === undefined) {
                return;
            }
            if (isObject(sourceValue) && key in target && isObject(target[key])) {
                output[key] = mergeDeep(target[key], sourceValue);
            } else {
                output[key] = sourceValue;
            }
        });
    }
    return output;
};
