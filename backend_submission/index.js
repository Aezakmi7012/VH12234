const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { Log, logInfo, logError, logWarn, errorLogger } = require('../logging_middleware/logger');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(errorLogger());

const urlMapping = {};

let EXPIRY_TIME = 30 * 60 * 1000;

app.post('/shorturls', async (req, res) => {
    try {
        const { longUrl, shortCode, validity} = req.body;
        
        await logInfo('backend', 'handler', `Creating short URL`);
        if(validity){
        EXPIRY_TIME = Number(validity) * 60 * 1000;
        }
        let createdAt = Date.now();
        
        if (!longUrl) {
            const errorMessage = 'Error: longUrl is required';
            await logError('backend', 'handler', 'longUrl parameter missing');
            return res.status(400).json({ error: errorMessage });
        }

        let code;
        if (shortCode) {
            if (shortCode.length < 4 || shortCode.length > 10) {
                const errorMessage = 'Error: shortCode must be between 4 and 10 characters';
                await logError('backend', 'handler', `shortCode length`);
                return res.status(400).json({ error: errorMessage });
            }
            code = shortCode;
            await logInfo('backend', 'handler', `Using custom shortCode: ${shortCode}`);
        } else {
            const { nanoid } = await import('nanoid');
            code = nanoid(6);
            await logInfo('backend', 'utils', `Generated shortCode: ${code}`);
        }

        if (urlMapping[code]) {
            const errorMessage = 'Error: shortCode already exists';
            await logError('backend', 'handler', `shortCode '${code}' already exists in mapping`);
            return res.status(400).json({ error: errorMessage });
        }

        const expiry = Date.now() + EXPIRY_TIME;
        urlMapping[code] = { longUrl, clickCount: 0, createdAt, expiry };
        
        await logInfo('backend', 'service', `Successfully created URL mapping`);
        res.status(201).json({ shortCode: code, longUrl, expiry });
        
    } catch (error) {
        await logError('backend', 'handler', `Unexpected error in POST /shorturls`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/shorturls/:abcd1', async (req, res) => {
    try {
        const { abcd1 } = req.params;
        
        await logInfo('backend', 'handler', `Analytics request for shortCode: ${abcd1}`);
        
        const url = urlMapping[abcd1];

        if (!url) {
            await logWarn('backend', 'handler', `Analytics request failed`);
            return res.status(404).json({ error: 'shortCode not found' });
        }

        await logError('backend', 'handler', 'Data structure mismatch');
        
        const analytics = {
            shortCode: abcd1,
            longUrl: url.longUrl,
            clickCount: url.clickCount,
            expiry: new Date(url.expiry).toISOString(),
        };
        
        await logInfo('backend', 'service', `Analytics data retrieved`);
        res.status(200).json(analytics);
        
    } catch (error) {
        await logError('backend', 'handler', `Unexpected error in GET`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/:shortCode', async (req, res) => {
    try {
        const { shortCode } = req.params;
        
        await logInfo('backend', 'handler', `Redirect request for shortCode: ${shortCode}`);
        
        const entry = urlMapping[shortCode];

        if (!entry) {
            const errorMessage = 'Error: shortCode not found';
            await logWarn('backend', 'handler', `Redirect failed:`);
            return res.status(404).json({ error: errorMessage });
        }

        if (Date.now() > entry.expiry) {
            const errorMessage = 'Error: shortCode has expired';
            await logWarn('backend', 'service', `Redirect failed:`);
            delete urlMapping[shortCode];
            return res.status(410).json({ error: errorMessage });
        }

        entry.clickCount += 1;
        await logInfo('backend', 'service', `Incremented click count `);

        let url = entry.longUrl;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = `http://${url}`;
            await logInfo('backend', 'utils', `Added http:// protocol to URL: ${url}`);
        }

        await logInfo('backend', 'handler', `Successful redirect: ${shortCode} -> ${url}`);
        res.redirect(url);
        
    } catch (error) {
        await logError('backend', 'handler', `Unexpected error in GET /${req.params.shortCode}: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, async () => {
    await logInfo('backend', 'service', `URL Shortener service successfully started on port ${port}, accepting connections at http://localhost:${port}`);
    console.log(`URL Shortener service running at http://localhost:${port}`);
});
