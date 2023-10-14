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

function noArraysExcept(exclusions = []) {
  return (argv) => {
    const defaultExclusions = ['_', '$0'];
    exclusions.push(...defaultExclusions);

    for (const key of Object.keys(argv).filter(
      (e) => !exclusions.includes(e),
    )) {
      if (Array.isArray(argv[key]))
        throw new Error(`Option '${key}' cannot be specified more than once.`);
    }

    return true;
  };
}

module.exports = { arrayify, expandHome, gracefulShutdown, noArraysExcept };
