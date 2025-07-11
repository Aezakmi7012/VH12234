const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const urlMapping = {};

let EXPIRY_TIME = 30 * 60 * 1000;

app.post('/shorturls', async (req, res) => {
    const { longUrl, shortCode, validity} = req.body;
    EXPIRY_TIME = Number(validity) * 60 * 1000;
    let createdAt = Date.now();
    if (!longUrl) {
        const errorMessage = 'Error: longUrl is required';
        return res.status(400).json({ error: errorMessage });
    }

    let code;
    if (shortCode) {
        if (shortCode.length < 4 || shortCode.length > 10) {
            const errorMessage = 'Error: shortCode must be between 4 and 10 characters';
          
            return res.status(400).json({ error: errorMessage });
        }
        code = shortCode;
    } else {
        const { nanoid } = await import('nanoid');
        code = nanoid(6);
    }

    if (urlMapping[code]) {
        const errorMessage = 'Error: shortCode already exists';

        return res.status(400).json({ error: errorMessage });
    }

    const expiry = Date.now() + EXPIRY_TIME;
    urlMapping[code] = { longUrl, clickCount: 0, createdAt, expiry };
    res.status(201).json({ shortCode: code, longUrl, expiry });
});

app.get('/shorturls/:abcd1', (req, res) => {
    const { abcd1 } = req.params;
    const url = urlMapping[abcd1];

    const analytics = {
            shorCode : url.shortCode,
            longUrl: url.data.longUrl,
            clickCount: url.data.clickCount,
            expiry: new Date(url.data.expiry).toISOString(),
        };
    res.status(200).json(analytics);
});

app.get('/:shortCode', (req, res) => {
    const { shortCode } = req.params;
    const entry = urlMapping[shortCode];

    if (!entry) {
        const errorMessage = 'Error: shortCode not found';
        return res.status(404).json({ error: errorMessage });
    }

    if (Date.now() > entry.expiry) {
        const errorMessage = 'Error: shortCode has expired';
        delete urlMapping[shortCode];
        return res.status(410).json({ error: errorMessage });
    }

    entry.clickCount += 1;

    let url = entry.longUrl;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `http://${url}`;
    }

    res.redirect(url);
});

app.listen(port, () => {
    console.log(`URL Shortener service running at http://localhost:${port}`);
});
