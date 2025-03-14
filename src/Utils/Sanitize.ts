function sanitizeString(str: string) {
    const pattern = /[^a-z0-9áéíóúñü .,_-`/]/gim;

    const output = str.replace(pattern, "").trim();
    const conflicts = str.match(pattern);
    return {
        output,
        conflicts
    };
}

export default sanitizeString;
