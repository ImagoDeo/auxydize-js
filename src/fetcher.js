const {
  getAllSecretNamesAndAliases,
  getSecretByName,
  getSecretByAlias,
  getAllSecrets,
} = require('./db');
const { arrayify } = require('./utils');
const printer = require('./printer');

function fetchSecrets(name, alias, partial, verbose) {
  let secrets = [];
  if (!name && !alias) {
    if (verbose)
      console.log(
        printer.verbose('No name or alias specified; fetching all secrets.'),
      );

    secrets = getAllSecrets();
  } else {
    if (verbose) console.log(printer.verbose('Arrayifying names and aliases'));
    let names = arrayify(name);
    let aliases = arrayify(alias);

    if (verbose)
      console.log(
        printer.verbose('Fetching all valid secret names and aliases.'),
      );
    const namesAndAliases = getAllSecretNamesAndAliases();
    const validNames = namesAndAliases.map((row) => row.name);
    const validAliases = namesAndAliases
      .map((row) => row.alias)
      .filter((alias) => alias !== null);

    if (partial) {
      if (verbose)
        console.log(printer.verbose('Partial flag set; converting partials.'));
      const { matchedNames, matchedAliases } = convertPartials(
        names,
        aliases,
        validNames,
        validAliases,
        verbose,
      );
      names = matchedNames;
      aliases = matchedAliases;
    } else {
      if (verbose)
        console.log(printer.verbose('Checking for invalid names and aliases.'));
      const filterInvalid = (all, param) => (e) => {
        if (!all.includes(e)) {
          console.log(
            printer.error(
              `Database does not contain a secret with ${param}: '${e}'`,
            ),
          );
          return false;
        } else {
          return true;
        }
      };
      names = names.filter(filterInvalid(validNames, 'name'));
      aliases = aliases.filter(filterInvalid(validAliases, 'alias'));
    }

    if (!names.length && !aliases.length) {
      console.log(printer.error('No valid names or aliases specified.'));
    } else {
      if (verbose)
        console.log(
          printer.verbose('At least one valid name or alias specified.'),
        );
      secrets = [
        ...names.map(getSecretByName),
        ...aliases.map(getSecretByAlias),
      ];
    }
  }

  if (verbose)
    console.log(printer.verbose(`Fetched ${secrets.length} secrets.`));
  return secrets;
}

function convertPartials(
  partialNames,
  partialAliases,
  validNames,
  validAliases,
  verbose,
) {
  const getMatches = (all, param) => (prev, partial) => {
    const matches = all.filter((e) => e.includes(partial));
    if (!matches.length) {
      console.log(
        printer.status(`No matches found for partial ${param}: '${partial}'`),
      );
    } else {
      if (verbose)
        console.log(
          printer.verbose(
            `${
              matches.length
            } matches found for partial ${param}: '${partial}': ${JSON.stringify(
              matches,
            )}`,
          ),
        );
      prev.push(...matches);
    }
    return prev;
  };

  if (verbose) console.log(printer.verbose('Matching names...'));
  const matchedNames = partialNames.reduce(getMatches(validNames, 'name'), []);

  if (verbose) console.log(printer.verbose('Matching aliases...'));
  const matchedAliases = partialAliases.reduce(
    getMatches(validAliases, 'alias'),
    [],
  );

  if (verbose) {
    console.log(
      printer.verbose(`Matched names: ${JSON.stringify(matchedNames)}`),
    );
    console.log(
      printer.verbose(`Matched aliases: ${JSON.stringify(matchedAliases)}`),
    );
  }

  return {
    matchedNames,
    matchedAliases,
  };
}

module.exports = { fetchSecrets };
