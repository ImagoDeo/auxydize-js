const { arrayify, noArraysExcept } = require('../utils');
const { generateTOTP } = require('../generator');
const {
  getAllSecrets,
  getAllSecretNames,
  getAllSecretAliases,
  getSecretByName,
  getSecretByAlias,
} = require('../db');
const printer = require('../printer');

function cmdGet(options) {
  const { name, alias, partial, verbose } = options;

  if (verbose) console.log(printer.verbose('Arrayifying names and aliases'));
  let names = arrayify(name);
  let aliases = arrayify(alias);

  if (partial) {
    if (verbose)
      console.log(printer.verbose('Partial flag set; converting partials.'));
    const { matchedNames, matchedAliases } = convertPartials(
      names,
      aliases,
      verbose,
    );
    names = matchedNames;
    aliases = matchedAliases;
  }

  if (verbose)
    console.log(printer.verbose('Retrieving secret(s) and printing.'));
  if (!names.length && !aliases.length) {
    if (verbose)
      console.log(
        printer.verbose('No names or aliases specified; getting all secrets.'),
      );
    const secrets = getAllSecrets();

    if (!secrets.length) {
      console.log(printer.status('No secrets found.'));
      return;
    }

    if (verbose)
      console.log(printer.verbose('At least one secret found. Printing...'));
    console.log(
      printer.totpList(
        secrets.map((secret) => {
          const { totp, validFor } = generateTOTP(secret);
          return {
            name: secret.name,
            totp,
            validFor,
          };
        }),
      ),
    );
  } else {
    if (verbose)
      console.log(printer.verbose('At least one name or alias specified.'));
    totpList(
      [...names.map(getSecretByName), ...aliases.map(getSecretByAlias)].map(
        (secret) => {
          if (verbose)
            console.log(
              printer.verbose(`Generating TOTP for '${secret.name}'`),
            );
          const { totp, validFor } = generateTOTP(secret);
          return {
            name: secret.name,
            totp,
            validFor,
          };
        },
      ),
    );
  }
}

function convertPartials(partialNames, partialAliases, verbose) {
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
  const matchedNames = partialNames.reduce(
    getMatches(getAllSecretNames(), 'name'),
    [],
  );

  if (verbose) console.log(printer.verbose('Matching aliases...'));
  const matchedAliases = partialAliases.reduce(
    getMatches(
      getAllSecretAliases().filter((alias) => alias !== null),
      'alias',
    ),
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

module.exports = {
  command: ['get'],
  describe: 'generate TOTPs',
  builder: (yargs) => {
    return yargs
      .option('name', {
        alias: 'n',
        describe: 'the name of a secret from which to generate a TOTP',
        type: 'string',
        requiresArg: true,
      })
      .option('alias', {
        alias: 'a',
        describe: 'the alias of a secret from which to generate a TOTP',
        type: 'string',
        requiresArg: true,
      })
      .option('partial', {
        alias: 'p',
        describe:
          'return TOTPs for partial matches on secret names and aliases',
        type: 'boolean',
      })
      .check(noArraysExcept(['name', 'n', 'alias', 'a']), false)
      .group(['name', 'alias', 'partial'], 'GET options:');
  },
  handler: cmdGet,
};
