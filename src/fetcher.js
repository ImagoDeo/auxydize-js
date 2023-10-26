const {
  getAllSecretAliases,
  getSecretByAlias,
  getAllSecrets,
} = require('./db');
const { arrayify } = require('./utils');
const printer = require('./printer');

function fetchSecrets(alias, partial, verbose) {
  let secrets = [];
  if (!alias || !alias.length) {
    if (verbose)
      console.log(printer.verbose('No alias specified; fetching all secrets.'));

    secrets = getAllSecrets();
  } else {
    if (verbose) console.log(printer.verbose('Arrayifying aliases'));
    let aliases = arrayify(alias);

    if (verbose)
      console.log(printer.verbose('Fetching all valid secret aliases.'));
    const validAliases = getAllSecretAliases();

    if (partial) {
      if (verbose)
        console.log(printer.verbose('Partial flag set; converting partials.'));
      const matchedAliases = convertPartials(aliases, validAliases, verbose);
      aliases = matchedAliases;
    } else {
      if (verbose)
        console.log(printer.verbose('Checking for invalid aliases.'));
      aliases = aliases.filter((alias) => {
        if (!validAliases.includes(alias)) {
          console.log(
            printer.error(
              `Database does not contain a secret with alias: '${alias}'`,
            ),
          );
          return false;
        } else {
          return true;
        }
      });
    }

    if (!aliases.length) {
      console.log(printer.error('No valid aliases specified.'));
    } else {
      if (verbose)
        console.log(printer.verbose('At least one valid alias specified.'));
      secrets = aliases.map(getSecretByAlias);
    }
  }

  if (verbose)
    console.log(printer.verbose(`Fetched ${secrets.length} secrets.`));
  return secrets;
}

function convertPartials(partialAliases, validAliases, verbose) {
  if (verbose) console.log(printer.verbose('Matching partial aliases...'));

  const matchedAliases = partialAliases.reduce((prev, partialAlias) => {
    const matches = validAliases.filter((alias) =>
      alias.includes(partialAlias),
    );

    if (!matches.length) {
      console.log(
        printer.status(`No matches found for partial alias: '${partialAlias}'`),
      );
    } else {
      if (verbose)
        console.log(
          printer.verbose(
            `${
              matches.length
            } matches found for partial alias: '${partialAlias}': ${JSON.stringify(
              matches,
            )}`,
          ),
        );
      prev.push(...matches);
    }

    return prev;
  }, []);

  if (verbose) {
    console.log(
      printer.verbose(`Matched aliases: ${JSON.stringify(matchedAliases)}`),
    );
  }

  return matchedAliases;
}

module.exports = { fetchSecrets };
