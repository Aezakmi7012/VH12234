const { logInfo } = require("../../logging_middleware/logger");

const urlMapping = {};

function createUrlMapping(code, longUrl, expiry) {
  const createdAt = Date.now();
  urlMapping[code] = { longUrl, clickCount: 0, createdAt, expiry };
  return urlMapping[code];
}

function getUrlMapping(code) {
  return urlMapping[code] || null;
}

function shortCodeExists(code) {
  return !!urlMapping[code];
}

function incrementClickCount(code) {
  if (urlMapping[code]) {
    urlMapping[code].clickCount += 1;
  }
}

function deleteUrlMapping(code) {
  delete urlMapping[code];
}

function cleanupExpiredUrls() {
  const now = Date.now();
  let cleanedCount = 0;
  for (const [code, entry] of Object.entries(urlMapping)) {
    if (now > entry.expiry) {
      delete urlMapping[code];
      cleanedCount++;
    }
  }
  if (cleanedCount > 0) {
    logInfo("backend", "service", `Cleaned up ${cleanedCount} expired URLs`);
  }
  return cleanedCount;
}

function getAllMappings() {
  return { ...urlMapping };
}

module.exports = {
  createUrlMapping,
  getUrlMapping,
  shortCodeExists,
  incrementClickCount,
  deleteUrlMapping,
  cleanupExpiredUrls,
  getAllMappings,
};
