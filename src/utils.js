const { cleanup } = require('./db');

function arrayify(optionValue) {
  if (optionValue === undefined) return [];
  return Array.isArray(optionValue) ? optionValue : [optionValue];
}

function expandHome(filePaths) {
  return filePaths.map((str) => {
    const replacement = str.replace(/^~/, process.env.HOME);
    return replacement;
  });
}

function gracefulShutdown() {
  console.log('\nClosing any open DB connections and shutting down.');
  cleanup();
}

module.exports = { arrayify, expandHome, gracefulShutdown };
