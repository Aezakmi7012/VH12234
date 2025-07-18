const { logInfo, logError, logWarn } = require('../../logging_middleware/logger');
const { isValidUrl, isValidShortCode, sanitizeInput } = require('../utils/validation');
const { createUrlMapping, getUrlMapping, shortCodeExists, incrementClickCount, deleteUrlMapping } = require('../services/urlService');

async function createShortUrl(req, res) {
    try {
        const { longUrl, shortCode, validity } = req.body;
        
        await logInfo('backend', 'handler', `Creating short URL`);
        
        if (!longUrl) {
            const errorMessage = 'Error: longUrl is required';
            await logError('backend', 'handler', 'longUrl parameter missing');
            return res.status(400).json({ error: errorMessage });
        }
        
        if (typeof longUrl !== 'string' || longUrl.trim().length === 0) {
            const errorMessage = 'Error: longUrl must be a non-empty string';
            await logError('backend', 'handler', 'longUrl is not a valid string');
            return res.status(400).json({ error: errorMessage });
        }
        
        const sanitizedLongUrl = sanitizeInput(longUrl.trim());
        
        let urlToValidate = sanitizedLongUrl;
        if (!urlToValidate.startsWith('http://') && !urlToValidate.startsWith('https://')) {
            urlToValidate = `http://${urlToValidate}`;
        }
        
        if (!isValidUrl(urlToValidate)) {
            const errorMessage = 'Error: longUrl is not a valid URL';
            await logError('backend', 'handler', 'Invalid URL format');
            return res.status(400).json({ error: errorMessage });
        }

        const urlToStore = urlToValidate;

        let expiry = 30 * 60 * 1000;
        if (validity !== undefined) {
            if (typeof validity !== 'number' && typeof validity !== 'string') {
                const errorMessage = 'Error: validity must be a number';
                await logError('backend', 'handler', 'validity parameter is not a number');
                return res.status(400).json({ error: errorMessage });
            }
            
            const validityNum = Number(validity);
            if (isNaN(validityNum) || validityNum <= 0) {
                const errorMessage = 'Error: validity must be a positive number';
                await logError('backend', 'handler', 'validity parameter is not a positive number');
                return res.status(400).json({ error: errorMessage });
            }
            
            if (validityNum > 10080) {
                const errorMessage = 'Error: validity exceeded';
                await logError('backend', 'handler', 'validity parameter exceeds maximum');
                return res.status(400).json({ error: errorMessage });
            }
            
            expiry = validityNum * 60 * 1000;
        }
        
        let code;
        
        if (shortCode) {
            if (typeof shortCode !== 'string') {
                const errorMessage = 'Error: shortCode must be a string';
                await logError('backend', 'handler', 'shortCode is not a string');
                return res.status(400).json({ error: errorMessage });
            }
            
            const sanitizedShortCode = sanitizeInput(shortCode.trim());
            
            if (sanitizedShortCode.length < 4 || sanitizedShortCode.length > 10) {
                const errorMessage = 'Error: shortCode must be between 4 and 10 characters';
                await logError('backend', 'handler', `shortCode length invalid`);
                return res.status(400).json({ error: errorMessage });
            }
            
            if (!isValidShortCode(sanitizedShortCode)) {
                const errorMessage = 'Error: shortCode can only contain letters, numbers, hyphens, and underscores';
                await logError('backend', 'handler', `contains invalid characters`);
                return res.status(400).json({ error: errorMessage });
            }
            
            code = sanitizedShortCode;
            await logInfo('backend', 'handler', `Using custom shortCode`);
        } else {
            const { nanoid } = await import('nanoid');
            code = nanoid(6);
            await logInfo('backend', 'utils', `Generated shortCode`);
        }

        if (shortCodeExists(code)) {
            const errorMessage = 'Error: shortCode already exists';
            await logError('backend', 'handler', `shortCode already exists in mapping`);
            return res.status(400).json({ error: errorMessage });
        }

        const expiryTimestamp = Date.now() + expiry;
        createUrlMapping(code, urlToStore, expiryTimestamp);
        
        await logInfo('backend', 'service', `created URL mapping`);
        res.status(201).json({ 
            shortCode: code, 
            longUrl: urlToStore, 
            expiry: new Date(expiryTimestamp).toISOString()
        });
        
    } catch (error) {
        await logError('backend', 'handler', `Error in POST /shorturls: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function getAnalytics(req, res) {
    try {
        const { abcd1 } = req.params;
        
        await logInfo('backend', 'handler', `Analytics request for code: ${abcd1}`);
        
        if (!abcd1 || typeof abcd1 !== 'string') {
            const errorMessage = 'Error: Invalid shortCode parameter';
            await logError('backend', 'handler', 'request with invalid shortCode');
            return res.status(400).json({ error: errorMessage });
        }
        
        const sanitizedCode = sanitizeInput(abcd1.trim());
        
        if (!isValidShortCode(sanitizedCode) || sanitizedCode.length < 1 || sanitizedCode.length > 10) {
            const errorMessage = 'Error: shortCode format is invalid';
            await logError('backend', 'handler', `Analytics request failed`);
            return res.status(400).json({ error: errorMessage });
        }
        
        const url = getUrlMapping(sanitizedCode);

        if (!url) {
            await logWarn('backend', 'handler', `shortCode not found`);
            return res.status(404).json({ error: 'shortCode not found' });
        }
        
        const analytics = {
            shortCode: sanitizedCode,
            longUrl: url.longUrl,
            clickCount: url.clickCount,
            createdAt: new Date(url.createdAt).toISOString(),
            expiry: new Date(url.expiry).toISOString(),
            isExpired: Date.now() > url.expiry
        };
        
        await logInfo('backend', 'service', `Analytics data retrieved`);
        res.status(200).json(analytics);
        
    } catch (error) {
        await logError('backend', 'handler', `Unexpected error in GET`);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function redirectToUrl(req, res) {
    try {
        const { shortCode } = req.params;
        
        await logInfo('backend', 'handler', `Redirect request for code: ${shortCode}`);
        
        if (!shortCode || typeof shortCode !== 'string') {
            const errorMessage = 'Error: Invalid shortCode parameter';
            await logError('backend', 'handler', 'Redirect request with invalid shortCode');
            return res.status(400).json({ error: errorMessage });
        }
        
        const sanitizedCode = sanitizeInput(shortCode.trim());
        
        if (!isValidShortCode(sanitizedCode) || sanitizedCode.length < 1 || sanitizedCode.length > 10) {
            const errorMessage = 'Error: shortCode format is invalid';
            await logError('backend', 'handler', `Redirect request with malformed shortCode: ${sanitizedCode}`);
            return res.status(400).json({ error: errorMessage });
        }
        
        const entry = getUrlMapping(sanitizedCode);

        if (!entry) {
            const errorMessage = 'Error: shortCode not found';
            await logWarn('backend', 'handler', `Redirect failed: shortCode not found - ${sanitizedCode}`);
            return res.status(404).json({ error: errorMessage });
        }

        if (Date.now() > entry.expiry) {
            const errorMessage = 'Error: shortCode has expired';
            await logWarn('backend', 'service', `Redirect failed: shortCode expired - ${sanitizedCode}`);
            deleteUrlMapping(sanitizedCode);
            return res.status(410).json({ error: errorMessage });
        }

        incrementClickCount(sanitizedCode);
        await logInfo('backend', 'service', `Incremented click count`);

        let url = entry.longUrl;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = `http://${url}`;
            await logInfo('backend', 'utils', `Added http:// protocol to URL: ${url}`);
        }
        
        await logInfo('backend', 'handler', `Successful redirect: ${sanitizedCode} -> ${url}`);
     //   console.log(url);
        res.redirect(url);
        
    } catch (error) {
        await logError('backend', 'handler', `error in GET redirect`);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    createShortUrl,
    getAnalytics,
    redirectToUrl
};
