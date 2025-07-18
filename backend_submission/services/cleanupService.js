const { cleanupExpiredUrls } = require('./urlService');

function startCleanupInterval() {
    const intervalMs = 5 * 60 * 1000;
    
    cleanupExpiredUrls();
    
    setInterval(() => {
        cleanupExpiredUrls();
    }, intervalMs);
}

module.exports = {
    startCleanupInterval
};
