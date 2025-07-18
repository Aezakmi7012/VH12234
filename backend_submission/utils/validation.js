const isValidUrl = (string) => {
    try {
        const url = new URL(string);
        return ['http:', 'https:'].includes(url.protocol);
    } catch (_) {
        return false;
    }
};

const isValidShortCode = (code) => {
    return /^[a-zA-Z0-9_-]+$/.test(code);
};

const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input.replace(/[<>\"'&]/g, '');
};

module.exports = {
    isValidUrl,
    isValidShortCode,
    sanitizeInput
};
