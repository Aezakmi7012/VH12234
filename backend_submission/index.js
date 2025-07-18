const express = require('express');
const cors = require('cors');
const { logInfo, errorLogger } = require('../logging_middleware/logger');
const urlRoutes = require('./routes/urlRoutes');
const { startCleanupInterval } = require('./services/cleanupService');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(errorLogger());

app.use('/', urlRoutes);

app.listen(port, async () => {
    await logInfo('backend', 'service', `URL Shortener service successfully started on port ${port}`);
    console.log(`URL Shortener service running at http://localhost:${port}`);
    startCleanupInterval();
});
