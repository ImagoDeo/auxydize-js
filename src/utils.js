function arrayify(optionValue) {
  if (optionValue === undefined) return [];
  return Array.isArray(optionValue) ? optionValue : [optionValue];
}

function expandHome(filepaths) {
  if (!filepaths) return;

  function replacer(string) {
    if (/^~/.test(string) && !process.env.HOME)
      throw new Error(`$HOME undefined - cannot expand ${string}`);
    return string.replace(/^~/, process.env.HOME);
  }

  if (!Array.isArray(filepaths)) return replacer(filepaths);

  return filepaths.map(replacer);
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

module.exports = { arrayify, expandHome, noArraysExcept };
