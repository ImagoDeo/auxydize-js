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

module.exports = { arrayify, expandHome };
