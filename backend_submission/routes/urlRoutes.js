const express = require('express');
const { createShortUrl, getAnalytics, redirectToUrl } = require('../controllers/urlController');

const router = express.Router();

router.post('/shorturls', createShortUrl);

router.get('/shorturls/:abcd1', getAnalytics);

router.get('/:shortCode', redirectToUrl);

module.exports = router;
